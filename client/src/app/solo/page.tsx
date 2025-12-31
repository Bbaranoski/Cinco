'use client';
import React from 'react';
import SoloGame from '@/components/SoloGame';
import ButtomBack from '@/components/ButtomBack';

export default function SoloPage() {
    return (
        <div className='bg-stone-500 min-h-screen p-4 flex flex-col items-center justify-between'>
            <h1 className='text-3xl font-bold mb-6'>
                MODO SOLO
            </h1>
            <SoloGame />
            <ButtomBack
                href="/"
            />
        </div>
    )
}