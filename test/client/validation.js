/* @flow */
/* eslint require-await: off, max-lines: off, max-nested-callbacks: off */

import { wrapPromise } from 'belter/src';
import { ZalgoPromise } from 'zalgo-promise/src';
import { FUNDING } from '@paypal/sdk-constants/src';

import { setupButton } from '../../src';

import { createButtonHTML, DEFAULT_FUNDING_ELIGIBILITY, clickButton } from './mocks';

describe('validation cases', () => {

    it('should render a button, enable the button, click, and call createOrder or onApprove', async () => {
        return await wrapPromise(async ({ expect }) => {

            const orderID = 'XXXXXXXXXX';

            window.xprops.onInit = expect('onInit', (data, actions) => {
                return actions.enable();
            });

            window.xprops.onClick = expect('onClick', () => ZalgoPromise.resolve());
            window.xprops.createOrder = expect('createOrder', () => ZalgoPromise.delay(50).then(() => orderID));
            window.xprops.onApprove = expect('onApprove', () => ZalgoPromise.resolve());

            createButtonHTML();
            await setupButton({ fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY });
            clickButton(FUNDING.PAYPAL);
        });
    });

    it('should render a button, disable the button, click, and not call Checkout or createOrder or onApprove', async () => {
        return await wrapPromise(async ({ expect, avoid }) => {

            window.xprops.onInit = expect('onInit', (data, actions) => {
                return actions.disable();
            });

            window.xprops.onClick = expect('onClick', () => ZalgoPromise.resolve());
            window.xprops.createOrder = avoid('createOrder', () => ZalgoPromise.reject(new Error(`Avoid createOrder`)));
            window.xprops.onApprove = avoid('onApprove', () => ZalgoPromise.reject(new Error(`Avoid onApprove`)));

            createButtonHTML();
            await setupButton({ fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY });
            clickButton(FUNDING.PAYPAL);
        });
    });

    it('should render a button, disable the button, re-enable the button, click, and call createOrder or onApprove', async () => {
        return await wrapPromise(async ({ expect }) => {

            const orderID = 'XXXXXXXXXX';

            window.xprops.onInit = expect('onInit', (data, actions) => {
                return actions.disable().then(() => {
                    return ZalgoPromise.delay(50);
                }).then(() => {
                    return actions.enable();
                });
            });

            window.xprops.onClick = expect('onClick', () => ZalgoPromise.resolve());
            window.xprops.createOrder = expect('createOrder', () => ZalgoPromise.delay(50).then(() => orderID));
            window.xprops.onApprove = expect('onApprove', () => ZalgoPromise.resolve());

            createButtonHTML();
            await setupButton({ fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY });
            clickButton(FUNDING.PAYPAL);
        });
    });

    it('should render a button, and resolve in onClick', async () => {
        return await wrapPromise(async ({ expect }) => {

            const orderID = 'XXXXXXXXXX';

            window.xprops.onClick = expect('onClick', (data, actions) => {
                return ZalgoPromise.delay(50).then(() => actions.resolve());
            });
            window.xprops.createOrder = expect('createOrder', () => ZalgoPromise.delay(50).then(() => orderID));
            window.xprops.onApprove = expect('onApprove', () => ZalgoPromise.resolve());
            
            createButtonHTML();
            await setupButton({ fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY });
            clickButton(FUNDING.PAYPAL);
        });
    });

    it('should render a button, and reject in onClick', async () => {
        return await wrapPromise(async ({ expect, avoid }) => {
            window.xprops.onClick = expect('onClick', (data, actions) => {
                return ZalgoPromise.delay(50).then(() => actions.reject());
            });

            window.xprops.createOrder = avoid('createOrder', () => ZalgoPromise.reject(new Error(`Avoid createOrder`)));
            window.xprops.onApprove = avoid('onApprove', () => ZalgoPromise.reject(new Error(`Avoid onApprove`)));

            createButtonHTML();
            await setupButton({ fundingEligibility: DEFAULT_FUNDING_ELIGIBILITY });
            clickButton(FUNDING.PAYPAL);
        });
    });
});
