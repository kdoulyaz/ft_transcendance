import React, { ChangeEvent, useState } from "react";
import { useUser } from "../hooks/useUser";
import {requestUploadAvatar} from "../requests/requestUser"

interface ImageInputProps {
  onImageChange: (image: string) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageChange }) => {
  const { user } = useUser();
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result as string);
        onImageChange(reader.result as string);


        

      //   const formData = new FormData();
      //   formData.append('avatar', file);
      //   axios
      // .post(
      //   "http://localhost:3080/user/uploadAvatar",
      //   formData,
      //   {
      //     withCredentials: true, // Include credentials in the request
      //   },
      // )
      // .then(() => {
      //   console.log("avatar uploaded");

      // });
      };

      reader.readAsDataURL(file);
      requestUploadAvatar(file)
    } else {
      setPreview(null);
      onImageChange("");
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="imageInput" className="cursor-pointer ">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="overflow-hidden w-24 ring ring-primary ring-offset-base-100 ring-offset-2 h-24 rounded-full"
          />
        ) : (
          <img
            src={user.avatarUrl}
            alt="Preview"
            className="overflow-hidden w-24 ring ring-primary ring-offset-base-100 ring-offset-2 h-24 rounded-full"
          />
        )}
      </label>
      <form>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="imageInput"
      />
      </form>
    </div>
  );
};

export default ImageInput;
