import Context from './Context';
import CryptoJS from 'crypto-js';

import cookies from 'js-cookie';

import { useEffect, useState } from 'react';
import { requestAuth, requestGetCart } from '../config/request';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});

    const [dataCart, setDataCart] = useState([]);

    const fetchDataCart = async () => {
        const res = await requestGetCart();
        setDataCart(res.metadata.newData);
    };

    const fetchAuth = async () => {
        const res = await requestAuth();
        const bytes = CryptoJS.AES.decrypt(res.metadata.auth, import.meta.env.VITE_SECRET_CRYPTO);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        const user = JSON.parse(originalText);
        setDataUser(user);
    };

    useEffect(() => {
        const token = cookies.get('logged');

        if (!token) {
            return;
        }
        fetchAuth();
        fetchDataCart();
    }, []);

    return (
        <Context.Provider
            value={{
                dataUser,
                fetchAuth,
                dataCart,
                fetchCart: fetchDataCart,
            }}
        >
            {children}
        </Context.Provider>
    );
}
