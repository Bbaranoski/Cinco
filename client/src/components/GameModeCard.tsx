'use client';
import React from "react";
import Link from "next/link";

type Props = {
    href: string;
    title: string;
    description?: string;
    emoji?: string;
}

export default function GameModeCard({ href, title, description, emoji = '🎮' }: Props) {
    return(
        <Link href={href} className="group block">
            <article className="border rounded-2xl p-6 w-72 min-h-[150px] flex flex-col justify-between
                transition-transform transform hover:-translate-y-1 hover:shadow-lg
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white dark:bg-gray-800"
                aria-label={`title-${title}`}
                tabIndex={0}
                >
                    <div>
                        <div className="text-4xl mb-4">{emoji}</div>
                        <h3 className="text-xl font-semibold mb-1"
                            id={`title-${title}`}
                        >{title}</h3>
                        {description && <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>}
                    </div>
                    
            </article>
        </Link>
    );
}