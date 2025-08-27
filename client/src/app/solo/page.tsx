'use client';
import React from 'react';
import SoloGame from '@/components/SoloGame';

export default function SoloPage() {
    return (
        <div className='bg-stone-500 min-h-screen p-4 flex flex-col items-center'>
            <h1 className='text-3xl font-bold mb-6'>
                Modo Solo
            </h1>
            <SoloGame />
        </div>
    )
}