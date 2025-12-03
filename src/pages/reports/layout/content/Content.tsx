import React, { FC, ReactNode } from "react";

interface IRepportContent {
    children: ReactNode
}

const ReportContent: FC<IRepportContent> = ({ children }) => (
    <div className="d-flex flex-column  justify-content-start w-100">
        {children}
    </div>
);

export default ReportContent