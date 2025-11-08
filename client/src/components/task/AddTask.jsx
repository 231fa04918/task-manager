import React, { useState } from "react"
import ModalWrapper from "../ModalWrapper"
import { Dialog } from "@headlessui/react"
import Textbox from "../Textbox"
import { useForm } from "react-hook-form"
import UserList from "./UserList"
import SelectList from "../SelectList"
import { BiImages } from "react-icons/bi"
import Button from "../Button"
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage"
import { app } from "../../utils/firebase"
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice"
import { toast } from "sonner"
import { dateFormatter } from "../../utils"

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"]
const PRIORITY = ["HIGH", "MEDIUM", "LOW"]

const uploadedFileURLs = []

const AddTask = ({ open, setOpen, task }) => {
  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    deadline: task?.deadline ? dateFormatter(task.deadline) : "",
    team: task?.team || [],
    stage: task?.stage?.toUpperCase() || LISTS[0],
    priority: task?.priority?.toUpperCase() || PRIORITY[1], // MEDIUM default
    assets: [],
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues })

  const [team, setTeam] = useState(task?.team || [])
  const [stage, setStage] = useState(defaultValues.stage)
  const [priority, setPriority] = useState(defaultValues.priority)
  const [assets, setAssets] = useState([])
  const [uploading, setUploading] = useState(false)

  const [createTask, { isLoading }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()
  const URLS = task?.assets ? [...task.assets] : []

  const submitHandler = async (data) => {
    for (const file of assets) {
      setUploading(true)
      try {
        await uploadFile(file)
      } catch (error) {
        console.error("Error uploading file:", error)
        return
      } finally {
        setUploading(false)
      }
    }

    try {
      const newData = {
        ...data,
        priority: priority.toLowerCase(),
        stage: stage.toLowerCase(),
        deadline: data.deadline ? new Date(data.deadline) : null,
        assets: [...URLS, ...uploadedFileURLs],
        team,
      }

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap()

      toast.success(res.message)

      setTimeout(() => {
        setOpen(false)
      }, 500)
    } catch (err) {
      console.log(err)
      toast.error(err?.data?.message || err.message)
    }
  }

  const handleSelect = (e) => {
    setAssets(e.target.files)
  }

  const uploadFile = async (file) => {
    const storage = getStorage(app)
    const name = new Date().getTime() + file.name
    const storageRef = ref(storage, name)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => reject(error),
        () =>
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              uploadedFileURLs.push(downloadURL)
              resolve()
            })
            .catch(reject)
      )
    })
  }

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-gray-900 mb-4"
        >
          {task ? "UPDATE TASK" : "ADD TASK"}
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Task Title"
            type="text"
            name="title"
            label="Task Title"
            className="w-full rounded"
            register={register("title", {
              required: "Title is required",
            })}
            error={errors.title?.message}
          />

          <UserList setTeam={setTeam} team={team} />

          <div className="flex gap-4">
            <SelectList
              label="Task Stage"
              lists={LISTS}
              selected={stage}
              setSelected={setStage}
            />

            <Textbox
              placeholder="Date"
              type="date"
              name="date"
              label="Task Date"
              className="w-full rounded"
              register={register("date", {
                required: "Date is required!",
              })}
              error={errors.date?.message}
            />
          </div>

          <div className="flex gap-4">
            <SelectList
              label="Priority Level"
              lists={PRIORITY}
              selected={priority}
              setSelected={setPriority}
            />

            <Textbox
              placeholder="Deadline"
              type="date"
              name="deadline"
              label="Deadline"
              className="w-full rounded"
              register={register("deadline")}
              error={errors.deadline?.message}
            />
          </div>

          <label
            className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
            htmlFor="imgUpload"
          >
            <input
              type="file"
              className="hidden"
              id="imgUpload"
              onChange={handleSelect}
              accept=".jpg, .png, .jpeg"
              multiple
            />
            <BiImages />
            <span>Add Assets</span>
          </label>

          <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
            {uploading ? (
              <span className="text-sm py-2 text-red-500">
                Uploading assets...
              </span>
            ) : (
              <Button
                label="Submit"
                type="submit"
                className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700"
              />
            )}

            <Button
              type="button"
              className="bg-white px-5 text-sm font-semibold text-gray-900"
              onClick={() => setOpen(false)}
              label="Cancel"
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  )
}

export default AddTask
