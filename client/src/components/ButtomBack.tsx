import Link from "next/link"

type ButtomBackProps = {
    href: string
}

export default function ButtomBack({ href }: ButtomBackProps) {
    return (
        <div className="fixed top-0 left-0 m-4 p-2">
            <Link href={href} className="hover:bg-neutral-50/20 rounded-md p-1">
                ↩
            </Link>
        </div>
    )
}