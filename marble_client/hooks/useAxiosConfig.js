'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";

const useAxiosConfig = () => {
    const { data: session } = useSession();
    const [token, setToken] = useState(null);

    useEffect(() => {

        // Tumhara token iss jagah hota hai:
        const userToken = session?.user?.accessToken;

        if (userToken) {
            setToken(userToken);

            // Automatically attach token to EVERY axios request
            axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
        }

    }, [session]);

    return { token };
};

export default useAxiosConfig;
