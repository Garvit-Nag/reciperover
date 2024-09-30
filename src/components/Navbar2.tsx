"use client";

import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import { cn } from "@/components/utils/cn";
import Link from "next/link";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSearch } from '@fortawesome/free-solid-svg-icons';

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
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
          <MenuItem setActive={setActive} active={active} item="Contact Us">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/recipes">Contact Us</HoveredLink>
          </div>
          </MenuItem>
        </Link>
        <Link href={"/search"}>
        <MenuItem setActive={setActive} active={active} item="Search">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/recipes">
              <div className="flex items-center space-x-2">
                <span>Search</span> 
              </div>
            </HoveredLink>
          </div>
        </MenuItem>
      </Link>

      </Menu>
    </div>
  );
}

export default Navbar;