import { ModuleWithProviders } from '@angular/core';

export interface ILogin {
    status: boolean,
    message: string,
    data: {
        permissions(arg0: string, permissions: any): unknown;
        user_id: any,
        role_id: any,
        username: string,
        first_name: string,
        last_name: string,
        phone_number: string,
        email: string,
        company_id: any,
        is_handling_scores:any,
        data:any,
        iv: any,
        logo:any
        
    },
    encryptredData:{
        data:any,
        iv:any
    }
    token: string,
    permissions: any
}


export interface ICommon {
    notification: any;
    entries: any;
    text: any;
    file_requests: any;
    status: boolean;
    code: any;
    message: string;
    data: any;
    admin_data:any,
    effectiveness_risk_data:any,
    contractor_feedback: any;
    customer_feedback: any;
    authUrl: any;
    PDFUrl: any;
    PDFName: any;
    daily_count: any;
    weekly_count: any;
    monthly_count: any;
    error:any,
    content:any,
    error_description:any,
    questions:any,
    id:any,
    managers:any,
    managerTags:any,
    date:any,
    url:any,
    tags:any,
    success:any,
    nra_risk_data:any
}


export interface ICommon {
    notification: any;
    entries: any;
    text: any;
    file_requests: any;
    status: boolean;
    code: any;
    message: string;
    data: any;
    contractor_feedback: any;
    customer_feedback: any;
    authUrl: any;
    PDFUrl: any;
    PDFName: any;
    daily_count: any;
    weekly_count: any;
    monthly_count: any;
    error:any,
    content:any,
    error_description:any,
    questions:any,
    id:any,
    managers:any,
    managerTags:any,
    date:any,
    url:any,
    tags:any
}