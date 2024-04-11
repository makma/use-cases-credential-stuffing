'use client';

import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useState } from 'react';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import styles from '../../pages/coupon-fraud/couponFraud.module.scss';
import formStyles from '../../styles/forms.module.scss';
import classNames from 'classnames';
import AirMax from '../../pages/coupon-fraud/shoeAirMax.svg';
import { Alert } from '../../client/components/common/Alert/Alert';
import Button from '../../client/components/common/Button/Button';
import { Cart } from '../../client/components/common/Cart/Cart';
import { FpjsProvider, useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { TEST_IDS } from '../../client/testIDs';
import { useMutation } from 'react-query';
import { ActivateRegionalPricingPayload, ActivateRegionalPricingResponse } from './api/activate-ppp/route';
import { useUnsealedResult } from '../../client/hooks/useUnsealedResult';
import { getFlagEmoji, getIpLocation } from '../../shared/utils/locationUtils';

const COURSE_PRICE = 100;
const TAXES = 0;

function LocationSpoofingUseCase() {
  const {
    getData: getVisitorData,
    data: visitorData,
    error,
  } = useVisitorData({
    ignoreCache: true,
  });
  const { data: unsealedVisitorData } = useUnsealedResult(visitorData?.sealedResult);

  const {
    mutate: activateRegionalPricing,
    isLoading,
    data: activateResponse,
  } = useMutation({
    mutationFn: async () => {
      const { requestId, sealedResult } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/location-spoofing/api/activate-ppp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, sealedResult } satisfies ActivateRegionalPricingPayload),
      });
      if (!response.ok || error) {
        throw new Error(
          'Failed to activate regional pricing: ' + (await response.json()).message ?? response.statusText,
        );
      }
      return await response.json();
    },
    onSuccess: (data: ActivateRegionalPricingResponse) => {
      if (data.severity === 'success') {
        setDiscount(data.data.discount);
      } else {
        setDiscount(0);
      }
    },
  });

  const [airMaxCount, setAirMaxCount] = useState(1);

  const [discount, setDiscount] = useState(0);

  const cartItems = [
    {
      id: 0,
      name: 'Fight Online Fraud Course',
      subheadline: 'Fingerprint Inc.',
      price: COURSE_PRICE,
      image: AirMax,
      count: airMaxCount,
      increaseCount: () => setAirMaxCount(airMaxCount + 1),
      decreaseCount: () => setAirMaxCount(Math.max(1, airMaxCount - 1)),
    },
  ];

  return (
    <div className={classNames(styles.wrapper, formStyles.wrapper)}>
      <Cart items={cartItems} discount={discount} taxPerItem={TAXES}></Cart>
      <div className={styles.innerWrapper}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            activateRegionalPricing();
          }}
          className={classNames(formStyles.useCaseForm, styles.couponFraudForm)}
        >
          <p>
            {unsealedVisitorData && (
              <>
                We noticed you are from {getFlagEmoji(getIpLocation(unsealedVisitorData)?.country?.code)}{' '}
                {getIpLocation(unsealedVisitorData)?.country?.name}! 👋{' '}
              </>
            )}
            To help facilitate global learning, we are offering purchasing power parity pricing.
          </p>
          <div className={styles.couponInputContainer}>
            <Button disabled={isLoading} size='medium' data-testid={TEST_IDS.couponFraud.submitCoupon}>
              {isLoading ? 'Verifying location...' : 'Activating regional pricing'}
            </Button>
          </div>
          {activateResponse?.message && !isLoading && (
            <div>
              <Alert severity={activateResponse.severity}>{activateResponse.message}</Alert>
            </div>
          )}
        </form>
      </div>
      <Button variant='white' type='button' size='small' disabled={true} className={styles.confirmOrderButton}>
        Confirm order
      </Button>
    </div>
  );
}

export default function Page() {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: '2lFEzpuyfqkfQ9KJgiqv',
      }}
    >
      <UseCaseWrapper useCase={USE_CASES.locationSpoofing}>
        <LocationSpoofingUseCase />
      </UseCaseWrapper>
    </FpjsProvider>
  );
}
