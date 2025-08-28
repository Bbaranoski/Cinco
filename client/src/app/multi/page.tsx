'use client';

import React from "react";
import Link from "next/link";

export default function MultiPage() {

    return(
        <div className='bg-stone-500 min-h-screen p-4 flex flex-col items-center justify-between'>
            <h1 className='text-3xl font-bold mb-6'>
                Multiplayer
            </h1>

            <Link href="/" className='text-indigo-600'>Voltar ao menu</Link>
        </div>
    );
}