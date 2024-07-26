import React from "react";
import { BsChatText } from "react-icons/bs";
import { FaTableTennisPaddleBall } from "react-icons/fa6";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlineLeaderboard } from "react-icons/md";
import { AiOutlineHome } from "react-icons/ai";

export interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.FC;
  current: boolean;
  color?: string;
}

export const sidebarNavigation: SidebarNavItem[] = [
  { name: "Home", href: "/home", icon: AiOutlineHome, current: true },
  { name: "Chat", href: "/chat", icon: BsChatText, current: true },
  { name: "Game", href: "/bot", icon: FaTableTennisPaddleBall, current: true },
  { name: "Friends", href: "/friends", icon: FaUserFriends, current: true },
  { name: "Leaderboard", href: "/leaderboard", icon: MdOutlineLeaderboard, current: true,},
];
