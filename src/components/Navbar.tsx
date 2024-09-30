"use client";

import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/components/utils/cn";
import Link from "next/link";

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-0 right-0 w-full max-w-10xl mx-auto z-50 font-fira", className)} // Increased max width
    >
      <Menu setActive={setActive}>
        <div className="flex justify-end space-x-16"> {/* Added larger spacing between items */}
          <Link href={"/"}>
            <MenuItem setActive={setActive} active={active} item="Home">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/">Home</HoveredLink>
              </div>
            </MenuItem>
          </Link>
          <MenuItem setActive={setActive} active={active} item="About">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="/recipes">About</HoveredLink>
            </div>
          </MenuItem>
          <Link href={"/resources"}>
            <MenuItem setActive={setActive} active={active} item="Resources">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/recipes">Resources</HoveredLink>
              </div>
            </MenuItem>
          </Link>
          <Link href={"/contact"}>
            <MenuItem setActive={setActive} active={active} item="Login">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/recipes">Login</HoveredLink>
              </div>
            </MenuItem>
          </Link>
          <Link href={"/search"}>
            <MenuItem setActive={setActive} active={active} item="SignUp">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/recipes">
                  <div className="flex items-center space-x-2">
                    <span>SignUp</span>
                  </div>
                </HoveredLink>
              </div>
            </MenuItem>
          </Link>
        </div>
      </Menu>
    </div>
  );
}

export default Navbar;