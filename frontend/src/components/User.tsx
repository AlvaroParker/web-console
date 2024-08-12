import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FullStop } from "../services/container";
import { ServiceError } from "../services/error";
import { UserInfo, UserInfoPayload } from "../services/users";

export function UserComponent() {
  const [userInfo, setUserInfo] = useState<UserInfoPayload | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const navigate = useNavigate();

  const didRequest = useRef(false);
  useEffect(() => {
    if (!didRequest.current) {
      didRequest.current = true;
      UserInfo().then((response) => {
        if (response.type === "Ok") {
          setUserInfo(response.value);
        } else if (response.type === "Err") {
          if (response.error === ServiceError.Unauthorized) {
            navigate("/login");
          }
        }
      });
    }
  });
  return (
    <>
      <section className="w-[27rem] mx-auto bg-gray-900 rounded-2xl px-8 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Regular user</span>
        </div>
        <div className="mt-6 w-fit mx-auto">
          <img
            src="/profile.svg"
            style={{ filter: "invert(1)" }}
            className="rounded-full w-28 "
            alt="profile picture"
            srcSet=""
          />
        </div>

        <div className="mt-8 ">
          <h2 className="text-white font-bold text-2xl tracking-wide">
            {userInfo?.name}
            <br /> {userInfo?.lastname}
          </h2>
        </div>
        <div>
          {userInfo?.running_containers != undefined &&
            userInfo?.running_containers.length > 0 && (
              <p className="text-emerald-400 font-semibold mt-2.5">
                {userInfo?.running_containers.length} running container
                {userInfo?.running_containers.length > 1 ? "s" : ""}
              </p>
            )}
          <Link to="/" className="text-yellow-400 font-semibold mt-2.5">
            {userInfo?.active_containers} active containers
          </Link>
        </div>

        <div className="mt-3 text-white text-sm">
          <span className="text-gray-400 font-semibold">{userInfo?.email}</span>
        </div>
        <button
          className="mt-3 w-full text-center text-white font-semibold text-sm flex items-center justify-center bg-blue-500 hover:bg-blue-700 focus:outline-none p-2 rounded-lg"
          onClick={() => setShowModal(true)}
        >
          <svg
            className="text-white fill-white mr-2"
            version="1.1"
            stroke="000000"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="20"
            height="20"
            viewBox="0 0 64 64"
            enableBackground="new 0 0 64 64"
          >
            <g id="CIRCLE__x2F__STOP_1_" enableBackground="new">
              <g id="CIRCLE__x2F__STOP">
                <path d="M40,21H24c-1.657,0-3,1.343-3,3v16c0,1.657,1.343,3,3,3h16c1.657,0,3-1.343,3-3V24C43,22.343,41.657,21,40,21z M32,0       C14.327,0,0,14.327,0,32s14.327,32,32,32s32-14.327,32-32S49.673,0,32,0z M32,58C17.641,58,6,46.359,6,32C6,17.641,17.641,6,32,6       c14.359,0,26,11.64,26,26C58,46.359,46.359,58,32,58z" />
              </g>
            </g>
          </svg>
          Stop all containers
        </button>
        <button
          className="w-full mt-6 bg-emerald-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-500 transition duration-200"
          onClick={() => {}}
        >
          Change password
        </button>
      </section>

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
                      Stop all containers
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-300">
                        This action will stop all running containers. Are you
                        sure you want to continue?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center justify-center">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  onClick={async () => {
                    await FullStop();
                    setShowModal(false);
                    setTimeout(() => setShowModalLoading(false), 2000);
                    setShowModalLoading(true);
                  }}
                >
                  Stop all containers
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 hover:bg-gray-300 sm:mt-0 sm:w-auto"
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${showModalLoading ? "flex items-center justify-center" : "hidden"} relative z-10`}
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        {/* Spinning wheel loader */}
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="pb-5 mb-5">
            <svg
              className="mt-5 animate-spin text-white fill-white"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Icon" strokeWidth="1" fill="none" fill-rule="evenodd">
                <g id="System" transform="translate(-240.000000, -384.000000)">
                  <g
                    id="loading_3_line"
                    transform="translate(240.000000, 384.000000)"
                  >
                    <path
                      d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z"
                      id="MingCute"
                      fillRule="nonzero"
                    />
                    <path
                      d="M12,4 C7.58172,4 4,7.58172 4,12 C4,16.4183 7.58172,20 12,20 C16.4183,20 20,16.4183 20,12 C20,7.58172 16.4183,4 12,4 Z M2,12 C2,6.47715 6.47715,2 12,2 C17.5228,2 22,6.47715 22,12 C22,17.5228 17.5228,22 12,22 C6.47715,22 2,17.5228 2,12 Z"
                      fill="#09244B"
                      opacity="0.1"
                    />
                    <path
                      d="M12.0001,4 C10.3541,4 8.82702,4.49602 7.55638,5.34655 C7.16795,5.60656 6.80342,5.89976 6.46691,6.22213 C6.06809,6.60418 5.43507,6.59058 5.05302,6.19176 C4.67097,5.79294 4.68457,5.15992 5.08339,4.77787 C5.50341,4.37552 5.95856,4.00939 6.44386,3.68454 C8.03342,2.62052 9.94582,2 12.0001,2 C12.5524,2 13.0001,2.44772 13.0001,3 C13.0001,3.55228 12.5524,4 12.0001,4 Z"
                      fill="#09244B"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
