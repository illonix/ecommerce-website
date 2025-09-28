import { ReactNode } from "react";

export function PageHeader({ children }: {children: ReactNode}) {
    return <h1 className = "text-fxl mb-4">{children}</h1>
}