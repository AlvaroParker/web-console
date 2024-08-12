import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ContainerInfo,
  DeleteContainer,
  ListContainers,
} from "../services/container";
import { capitalize } from "./util";
import { ServiceError } from "../services/error";

// Todo: Rerender component on delete
export function ContainersComponent() {
  const hashMap = new Map<string, string>([
    ["ubuntu:22.04", "https://cdn.svgporn.com/logos/ubuntu.svg"],
    ["python:3.11", "https://cdn.svgporn.com/logos/python.svg"],
    ["debian:stable", "https://cdn.svgporn.com/logos/debian.svg"],
    ["alpine:3.14", "https://cdn.svgporn.com/logos/linux-tux.svg"],
    ["archlinux:base-devel", "https://cdn.svgporn.com/logos/archlinux.svg"],
  ]);
  const [containers, setContainers] = React.useState<ContainerInfo[] | null>(
    null
  );
  const navigate = useNavigate();
  const [toDelete, setToDelete] = React.useState<string>("");
  const [toDeleteName, setToDeleteName] = React.useState<string>("");
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [updated, setUpdated] = React.useState<boolean>(false);

  const updateContainers = () => {
    ListContainers().then((res) => {
      if (res.type === "Ok") {
        setContainers(res.value)
      } else if (res.type === "Err") {
        switch (res.error) {
          case ServiceError.Unauthorized:
            navigate("/login");
            break;
          case ServiceError.InternalServerError:
            // TODO
            break;
          default:
            // TODO
            break;
        }
      }
    });
  };
  useEffect(() => {
    updateContainers();
    document.title = "Web Terminal | Containers";
  }, []);
  useEffect(() => {
    updateContainers();
  }, [updated]);

  const handleClick = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    setToDeleteName(name);
    setToDelete(id);
    setShowModal(true);
  };

  const deleteContainer = (e: React.MouseEvent) => {
    e.preventDefault();
    DeleteContainer(toDelete).then((res) => {
      if (res.type === "Ok") {
        setUpdated(!updated);
      } else if (res.type === "Err") {
        switch (res.error) {
          case ServiceError.Unauthorized:
            navigate("/login");
            break;
          default:
            break

        }
      }
    });
    setShowModal(false);
    setToDelete("");
  };

  //<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19H21M3 5L11 12L3 19"></path>
  return (
    <>
      <div className="flex-grow mt-5">
        <h1 className="text-3xl text-gray-100 font-medium text-center">
          Available Linux containers
        </h1>
        <p className="text-gray-300 text-center">
          Click on the button to access the machine
        </p>
        {containers?.map((item) => (
          <div
            className="max-w-7xl mx-auto my-5 transition-all"
            key={item.containerid}
          >
            <div className="relative">
              <div className="absolute from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative px-7 py-6 bg-gray-900 ring-1 ring-gray-900/5 rounded-lg leading-none flex items-center justify-start space-x-6">
                <div className="flex-grow flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <svg
                      className="w-8 h-8 text-green-400"
                      fill="none"
                      viewBox="0 0 40 40"
                    >
                      <image
                        xlinkHref={hashMap.get(item.image + ":" + item.tag)}
                        width="40"
                      />
                    </svg>
                    <Link
                      to={`/terminal/${item.containerid}`}
                      className="cursor-pointer space-y-2 group"
                    >
                      <h2 className="text-gray-100 text-2xl font-semibold">
                        {item.name}
                      </h2>
                      <h3 className="text-gray-400 text-xl">
                        {capitalize(item.image)}:{item.tag}
                      </h3>
                      <button className="block text-green-400 group-hover:text-green-800 transition duration-200">
                        Access Machine →
                      </button>
                    </Link>
                  </div>
                  <button
                    onClick={(e) => handleClick(e, item.containerid, item.name)}
                  >
                    <svg
                      className="w-6 h-6 stroke-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        d="M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M10 11.5V16.5M14 11.5V16.5M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className={showModal ? "" : "hidden" + ` relative z-10`}
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-gray-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3
                      className="text-base font-semibold leading-6 text-gray-100"
                      id="modal-title"
                    >
                      Delete container {toDeleteName}{" "}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-300">
                        Are you sure you want to delete this container? All of
                        the data will be permanently removed. This action cannot
                        be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  onClick={deleteContainer}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 hover:bg-gray-300 sm:mt-0 sm:w-auto"
                  onClick={() => {
                    setShowModal(false);
                    setToDelete("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
