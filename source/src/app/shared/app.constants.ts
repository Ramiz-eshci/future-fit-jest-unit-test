
import { environment } from '../../environments/environment';


export function createUrl(actionName: string): string {
    return `${environment.apiHost}${actionName}`;
}

export const appApi = {
    login: createUrl('auth/login'),
    refreshToken: createUrl('oauth/token'),
    signup: createUrl('auth/register'),
    logout: createUrl('auth/logout'),
    forgotPassword: createUrl('auth/forgot-password'),
    changePassword: createUrl('auth/change-password')
};


export const errorMessage = {
    pageNotFound: 'Page not found',
    forbidden: 'Forbidden',
    internalServerError: 'Internal Server error',
    unknownError: 'Unknown Error (Response not get)',
    httpError: 'There was an HTTP error.',
    typeError: 'There was a Type error.',
    generalError: 'There was a general error.',
    somethingWrong: 'Nobody threw an Error but something wrong!',
    tokenError: 'Session expired please login again'
}
