'use client';

import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/content';
import Button from '../../client/components/Button/Button';

import styles from './paymentFraud.module.scss';
import formStyles from '../../client/styles/forms.module.scss';
import { Alert } from '../../client/components/Alert/Alert';
import classNames from 'classnames';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { TEST_IDS } from '../../client/testIDs';
import { PaymentPayload, PaymentResponse } from './api/place-order/route';
import { useMutation } from 'react-query';
import { FPJS_CLIENT_TIMEOUT } from '../../const';

export function PaymentFraud({ embed }: { embed?: boolean }) {
  const { getData: getVisitorData } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    { immediate: false },
  );

  // Default mocked card data
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardExpiration, setCardExpiration] = useState('04/28');
  const [filedChargeback, setFiledChargeback] = useState(false);
  const [usingStolenCard, setUsingStolenCard] = useState(false);

  const {
    mutate: submitPayment,
    isLoading: isLoadingPayment,
    data: paymentResponse,
    error: paymentNetworkError,
  } = useMutation<PaymentResponse, Error, Omit<PaymentPayload, 'requestId'>, unknown>({
    mutationKey: ['request loan'],
    mutationFn: async (payment) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/payment-fraud/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payment,
          requestId,
        } satisfies PaymentPayload),
      });
      return await response.json();
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitPayment({
      filedChargeback: filedChargeback,
      usingStolenCard,
      card: {
        number: cardNumber,
        cvv: cardCvv,
        expiration: cardExpiration,
      },
    });
  }

  return (
    <UseCaseWrapper useCase={USE_CASES.paymentFraud} embed={embed}>
      <div className={formStyles.wrapper}>
        <form onSubmit={handleSubmit} className={classNames(formStyles.useCaseForm, styles.paymentForm)}>
          <label>Card Number</label>
          <input
            type='text'
            name='cardNumber'
            placeholder='Card Number'
            defaultValue={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            data-testid={TEST_IDS.paymentFraud.cardNumber}
          />

          <div className={styles.ccInfoGroup}>
            <div>
              <label>Expiration</label>
              <input
                type='text'
                placeholder='Expiration'
                defaultValue={cardExpiration}
                onChange={(e) => setCardExpiration(e.target.value)}
                required
                data-testid={TEST_IDS.paymentFraud.cardExpiration}
              />
            </div>

            <div>
              <label>CVV</label>
              <input
                type='text'
                placeholder='CVV'
                defaultValue={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                required
                data-testid={TEST_IDS.paymentFraud.cardCvv}
              />
            </div>
          </div>

          <hr />

          <div className={styles.checkboxes}>
            <label className={formStyles.checkboxLabel}>
              <input
                type='checkbox'
                name='applyChargeback'
                onChange={(event) => setFiledChargeback(event.target.checked)}
                data-testid={TEST_IDS.paymentFraud.askForChargeback}
              />
              Ask for chargeback after purchase
            </label>

            <label className={formStyles.checkboxLabel}>
              <input
                type='checkbox'
                name='usingStolenCard'
                onChange={(event) => {
                  setUsingStolenCard(event.target.checked);
                }}
                data-testid={TEST_IDS.paymentFraud.usingStolenCard}
              />
              Flag this visitor using stolen card after purchase
            </label>
          </div>

          {paymentNetworkError ? <Alert severity='error'>{paymentNetworkError.message}</Alert> : null}
          {paymentResponse ? <Alert severity={paymentResponse.severity}>{paymentResponse.message}</Alert> : null}
          <Button
            disabled={isLoadingPayment}
            size='large'
            type='submit'
            data-testid={TEST_IDS.paymentFraud.submitPayment}
          >
            {isLoadingPayment ? 'Hold on, doing magic...' : 'Place Order'}
          </Button>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
