'use client';

import 'swagger-ui-react/swagger-ui.css';

import SwaggerUI from 'swagger-ui-react';

export default function DocsPage() {
    return (
        <div className="h-screen">
            <SwaggerUI url="/api/docs" />
        </div>
    );
}