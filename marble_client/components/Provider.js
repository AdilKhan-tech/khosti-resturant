"use client"
import React from "react"
import {SessionProvider} from "next-auth/react"
import RbacSessionBootstrap from "@/components/auth/RbacSessionBootstrap"

const Providers = ({children}) => {
    return (
        <SessionProvider>
            <RbacSessionBootstrap />
            {children}
        </SessionProvider>
    )
};

export default Providers;