import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from './../../../common/ConfirmationModal';
import { deleteProfile } from "../../../../services/operations/SettingsAPI";

export default function DeleteAccount() {
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [check, setCheck] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <>
      <div className="my-10 rounded-lg bg-gray-800 p-8 shadow-lg">
        <div className="flex items-center space-x-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
            <FiTrash2 className="text-3xl text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-4">Delete Account</h2>
            <div className="text-gray-300 space-y-3">
              <p>Would you like to delete your account?</p>
              <p>
                This account may contain Paid Courses. Deleting your account is
                permanent and will remove all the content associated with it.
              </p>
            </div>
            <div className="mt-6 flex items-center space-x-3">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-red-600 rounded cursor-pointer"
                checked={check}
                onChange={() => setCheck(prev => !prev)}
              />
              <button
                type="button"
                className={`text-red-400 italic ${check ? 'hover:text-red-300' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => check &&
                  setConfirmationModal({
                    text1: "Are you sure?",
                    text2: "Delete my account...!",
                    btn1Text: "Delete",
                    btn2Text: "Cancel",
                    btn1Handler: () => dispatch(deleteProfile(token, navigate)),
                    btn2Handler: () => { setConfirmationModal(null); setCheck(false) },
                  })
                }
              >
                I want to delete my account.
              </button>
            </div>
          </div>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
