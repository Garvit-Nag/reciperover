"use client";

import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/components/utils/cn";
import Link from "next/link";

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-0 right-0 w-full max-w-10xl mx-auto z-50 ", className)}
    >
      <Menu setActive={setActive}>
        <div className="flex justify-between items-center w-full px-8"> 
          
          {/* Logo on the left */}
          <div className="flex items-center space-x-4">
            <img src="/" alt="" className="h-10" /> 
            {/* <span className="font-bold text-lg">Recipe Rover</span>  */}
          </div>
        
          <div className="flex space-x-14"> 
            <Link href={"/"}>
              <MenuItem setActive={setActive} active={active} item="Home">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/">Home</HoveredLink>
                </div>
              </MenuItem>
            </Link>
            <MenuItem setActive={setActive} active={active} item="About">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/about">About</HoveredLink>
              </div>
            </MenuItem>
            <Link href={"/resources"}>
              <MenuItem setActive={setActive} active={active} item="Resources">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/resources">Resources</HoveredLink>
                </div>
              </MenuItem>
            </Link>
            <MenuItem setActive={setActive} active={active} item="Search">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/search">Search</HoveredLink>
                </div>
            </MenuItem>
          </div>
        
          <div className="flex items-center space-x-8">
            <Link href={"/login"}>
              <div className="flex items-center justify-center space-y-4 text-lg rounded-lg">
                LogIn 
              </div>
            </Link>
            <Link href={"/signup"}>
              <div className="flex items-center text-black justify-center space-y-4 text-lg border-2 bg-white px-4 py-2 rounded-lg">
                SignUp
              </div>
            </Link>
          </div>
        </div>
      </Menu>
    </div>
  );
}

export default Navbar;