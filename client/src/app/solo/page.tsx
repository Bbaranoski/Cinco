'use client';
import React from 'react';
import SoloGame from '@/components/SoloGame';

export default function SoloPage() {
    return (
        <div className='p-4'>
            <h1 className='text-3xl font-bold mb-6'>
                Modo Solo
            </h1>
            <SoloGame />
        </div>
    )
}