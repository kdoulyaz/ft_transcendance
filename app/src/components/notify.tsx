import React, { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

const FriendRequestsComponent: React.FC = () => {
  useEffect(() => {
    // Make a GET request to fetch friend requests
    axios
      .get("/friend-requests")
      .then((response) => {
        const friendRequests = response.data;
        // Iterate over friendRequests array and show a toast for each request
        friendRequests.forEach((request: any) => {
          toast.info(`You have a friend request from ${request.sender}`, {
            position: "top-right",
            autoClose: 5000, // Duration for the toast
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });
      })
      .catch((error) => {
        if (isAxiosError(error))
          toast.error(error.response?.data?.message);
        // console.error("Error fetching friend requests:", error);
      });
  }, []);

  return <div>{/* Your component JSX */}</div>;
};

export default FriendRequestsComponent;
