import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import Swal from 'sweetalert2';
import { GlobalFlagService } from '../services/global-flag.service';

@Injectable({ providedIn: 'root' })
export class GlobalUnsavedGuard implements CanDeactivate<unknown> {
    constructor(private globalFlagService: GlobalFlagService) { }
    async canDeactivate(
        component: unknown,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot,

    ): Promise<boolean> {
        const currentUrl = currentState.url;
        const shouldCheck = currentUrl.includes('/add') || currentUrl.includes('/edit');

        if (!shouldCheck) return true;

        // ✅ Check if form was submitted
        if (this.globalFlagService.isSubmitted()) {
            this.globalFlagService.setSubmitted(false); // Reset for next time
            return true;
        }
        const forms = document.querySelectorAll('.ng-dirty');
        if (forms.length > 0) {
            const result = await Swal.fire({
                title: 'Unsaved changes',
                text: 'You have unsaved changes. Do you really want to switch steps?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, discard changes',
                cancelButtonText: 'Stay on this step',
            });
            return result.isConfirmed;
        }

        return true;
    }
}
