import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Landing from "./components/Landing";
import Home from "./components/Home";
import { NotFound,ServerError,BadRequestPage,ForbiddenPage } from "./ErrorPage/ErrorPages";
// import Profile from "./components/profile";
import PracticeMode from "./components/game/PracticeMode";
import OnlineMode from "./components/game/OnlineMode";
import Leaderboard from "./components/Leaderboard";
import Bars from "./components/bars";
import RequireAuth from "./components/routing-private";
import NotFoundPage from "./components/notFound";
import Friends from "./components/friends";
// import Chat from "../duplicated/chat/Chat";
import { Profile, ProfilePage } from "./components/Profile";
import SignIn2FA from "./components/2fa-signin";
import Layout from "./components/chat/Layout";
import Dms from "./components/chat/Dms";
import Rooms from "./components/chat/Rooms";
// import ErrorBoundary from "./components/ErrorBoundary";


function App() {
  return (
    // <ErrorBoundary>
      <div>
      <Routes>
        /* public routes */
        <Route path="/" element={<Landing />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/not-found"
          element={<NotFoundPage></NotFoundPage>}
        ></Route>
        //Error pages
        <Route path="/400" element={<BadRequestPage></BadRequestPage>}></Route>
        <Route path="/404" element={<NotFound></NotFound>}></Route>
        <Route path="/500" element={<ServerError></ServerError>}></Route>
        <Route path="/403" element={<ForbiddenPage></ForbiddenPage>}></Route>
        <Route path="*" element={<NotFoundPage></NotFoundPage>}></Route>
        <Route path="/2fa-sign-in" element={<SignIn2FA />} />
        /* private routes */
        <Route element={<RequireAuth />}>
          setIsLogged(true);
          <Route element={<Bars />}>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/friends" element={<Friends />}></Route>
            <Route path="/leaderboard" element={<Leaderboard />}></Route>
            <Route path="/profile/:id" element={<ProfilePage />}></Route>
            <Route path="/me" element={<Profile />}></Route>
            {/* <Route path="/chat" element={ <Chat /> }></Route> */}
            <Route path="/chat" element={<Layout />}>
              <Route
                index
                element={
                  <div className=" h-full text-black flex bg-violet-500  flex-grow justify-center items-center">
                    <div className="text-poppins text-slate-700 text-2xl">
                      no conversation selected
                    </div>
                  </div>
                }
              />
              <Route path="dm/:id" element={<Dms />} />
              <Route path="room/:id" element={<Rooms />} />
            </Route>
          </Route>
          <Route
            path="/classic/"
            element={
              <div className={"bg-[#150142] w-screen h-screen"}>
                <OnlineMode type={"classic"} />
              </div>
            }
          ></Route>
          <Route
            path="/quick/"
            element={
              <div className={"bg-[#150142] w-screen h-screen"}>
                <OnlineMode type={"quick"} />
              </div>
            }
          ></Route>
          <Route
            path="/bot/"
            element={
              <div className={"bg-[#150142] w-screen h-screen"}>
                <PracticeMode />
              </div>
            }
          ></Route>
        </Route>
        setIsLogged(false);
      </Routes>
    </div>
    // {/* </ErrorBoundary> */}
  );
}
export default App;
