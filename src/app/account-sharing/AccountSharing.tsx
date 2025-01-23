'use client';

import { useEffect, useState } from 'react';
import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/content';
import styles from './accountSharing.module.scss';
import formStyles from '../../client/styles/forms.module.scss';
import classNames from 'classnames';
import hiddenIcon from '../../client/img/iconHidden.svg';
import shownIcon from '../../client/img/iconShown.svg';
import Image from 'next/image';
import { TEST_IDS } from '../../client/testIDs';
import Button from '../../client/components/Button/Button';
import { FPJS_CLIENT_TIMEOUT } from '../../const';
import { useMutation } from 'react-query';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { CreateAccountPayload, CreateAccountResponse } from './api/create-account/route';
import { Alert } from '../../client/components/Alert/Alert';
import { LoginPayload, LoginResponse } from './api/login/route';
import { BackArrow } from '../../client/components/BackArrow/BackArrow';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryState, parseAsStringEnum } from 'next-usequerystate';
import { ACCOUNT_SHARING_COPY } from './const';
import { useSessionStorage } from 'react-use';

const TEST_ID = TEST_IDS.accountSharing;

const deleteQueryParam = (param: string) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState({}, '', url);
};

export const AccountSharing = ({ embed }: { embed?: boolean }) => {
  // Start with empty username and password to make user create their own account
  // and avoid potentially interfering with other people's demos
  // Note: Can use `DEFAULT_USER` for development purposes
  const [username, setUsername] = useSessionStorage('username', '');
  const [password, setPassword] = useSessionStorage('password', '');
  const [showPassword, setShowPassword] = useSessionStorage('showPassword', false);
  const [mode, setMode] = useQueryState<'signup' | 'login'>(
    'mode',
    parseAsStringEnum(['signup', 'login']).withDefault('signup'),
  );

  // Get potential app state from query params, then delete the query params
  // so the alerts go away on page reload
  const [justLoggedOut, setJustLoggedOut] = useState<boolean | null>(null);
  const [otherDevice, setOtherDevice] = useState<string | null>(null);
  const searchParams = useSearchParams();
  useEffect(() => {
    const justLoggedOut = searchParams.get('justLoggedOut');
    if (justLoggedOut) {
      setJustLoggedOut(justLoggedOut === 'true');
      deleteQueryParam('justLoggedOut');
    }

    const otherDevice = searchParams.get('otherDevice');
    if (otherDevice) {
      setOtherDevice(otherDevice);
      deleteQueryParam('otherDevice');
    }
  }, [searchParams]);

  // We need to store the current login response to be able to keep displaying it while new request is in progress
  const [currentLoginResponse, setCurrentLoginResponse] = useState<LoginResponse | null>(null);

  const router = useRouter();

  const { getData: getVisitorData } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    {
      immediate: false,
    },
  );

  const {
    mutate: createAccount,
    isLoading: isLoadingCreateAccount,
    data: createAccountResponse,
    error: createAccountError,
    reset: resetCreateAccountMutation,
  } = useMutation<CreateAccountResponse, Error, Omit<CreateAccountPayload, 'requestId' | 'visitorId'>>({
    mutationKey: ['login attempt'],
    mutationFn: async ({ username, password }) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/account-sharing/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, requestId } satisfies CreateAccountPayload),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.severity === 'success') {
        router.push(`/account-sharing/home/${username}/${embed ? 'embed' : ''}`, { scroll: false });
      }
    },
  });

  const {
    mutate: login,
    isLoading: isLoadingLogin,
    data: loginResponse,
    error: loginError,
    reset: resetLoginMutation,
  } = useMutation<LoginResponse, Error, Omit<LoginPayload, 'requestId' | 'visitorId'>>({
    mutationKey: ['login attempt'],
    mutationFn: async ({ username, password, force }) => {
      setJustLoggedOut(null);
      setOtherDevice(null);
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/account-sharing/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, requestId, force } satisfies LoginPayload),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setCurrentLoginResponse(data);
      if (data.severity === 'success') {
        router.push(`/account-sharing/home/${username}/${embed ? 'embed' : ''}`, { scroll: false });
      }
    },
  });

  const formMarkup = (
    <>
      <label>Username</label>
      <input
        type='text'
        name='username'
        placeholder='Username'
        defaultValue={username}
        onChange={(e) => setUsername(e.target.value)}
        data-testid={TEST_ID.usernameInput}
        required
      />

      <label>Password</label>
      <input
        name='password'
        placeholder='Password'
        className={styles.password}
        type={showPassword ? 'text' : 'password'}
        defaultValue={password}
        data-testid={TEST_ID.passwordInput}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className={styles.showHideIcon} type='button' onClick={() => setShowPassword(!showPassword)}>
        <Image src={showPassword ? shownIcon : hiddenIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
      </button>
    </>
  );

  const signUpMarkup = (
    <>
      {formMarkup}
      <Button disabled={isLoadingCreateAccount} type='submit' data-testid={TEST_ID.signUpButton}>
        {isLoadingCreateAccount ? 'One moment...' : 'Sign up'}
      </Button>
      {createAccountError && <Alert severity='error'>{createAccountError.message}</Alert>}
      {createAccountResponse?.message && (
        <Alert severity={createAccountResponse.severity} className={styles.alert}>
          {createAccountResponse.message}
        </Alert>
      )}
      <p className={styles.switchMode}>
        Already have an account?{' '}
        <button
          type='button'
          data-testid={TEST_ID.switchToLoginButton}
          onClick={() => {
            setMode('login');
            resetCreateAccountMutation();
          }}
        >
          Log in
        </button>
      </p>
    </>
  );

  const loginMarkup = (
    <>
      {formMarkup}
      <Button disabled={isLoadingLogin} type='submit' data-testid={TEST_ID.loginButton}>
        {isLoadingLogin || loginResponse?.severity === 'success' ? 'One moment...' : 'Log in'}
      </Button>
      {loginError && <Alert severity='error'>{loginError.message}</Alert>}
      {loginResponse?.message && loginResponse.severity !== 'success' && (
        <Alert severity={loginResponse.severity} className={styles.alert}>
          {loginResponse.message}
        </Alert>
      )}
      <p className={styles.switchMode}>
        Don't have an account yet?{' '}
        <button
          data-testid={TEST_ID.switchToSignUpButton}
          type='button'
          onClick={() => {
            setMode('signup');
            setJustLoggedOut(null);
            setOtherDevice(null);
            resetLoginMutation();
          }}
        >
          Sign up first
        </button>
      </p>
    </>
  );

  const challengeMarkup = (
    <>
      {currentLoginResponse?.message && (
        <>
          <Alert severity={currentLoginResponse.severity} className={styles.alert}>
            {currentLoginResponse.message}
          </Alert>
          <div className={styles.challengeButtons}>
            <Button
              variant='primary'
              size='medium'
              onClick={() => login({ username, password, force: true })}
              data-testid={TEST_ID.forceLoginButton}
            >
              {isLoadingLogin || loginResponse?.severity === 'success' ? 'One moment...' : 'Log in here, log out there'}
            </Button>
            <Button variant='green' size='medium' disabled>
              Upgrade account
            </Button>
          </div>
          <BackArrow
            as='button'
            className={styles.backArrow}
            testId={TEST_ID.challengeGoBackButton}
            onClick={async () => {
              // Reset login mutation
              resetLoginMutation();
              setCurrentLoginResponse(null);
              setMode('login');
            }}
            label='Go back'
          />
        </>
      )}
    </>
  );

  let loggedOutAlert = null;
  if (mode === 'login' && justLoggedOut) {
    if (otherDevice) {
      loggedOutAlert = (
        <Alert
          severity='warning'
          className={styles.loggedOutAlert}
          onClose={() => {
            setJustLoggedOut(null);
            setOtherDevice(null);
          }}
        >
          <div className={styles.loggedOutAlertTitle}>{ACCOUNT_SHARING_COPY.youWereLoggedOut}</div>
          You are logged in on {otherDevice}. You current plan allows you to use FraudFlix on one device at a time.
          Consider <span style={{ textDecoration: 'underline' }}> upgrading your plan</span> to enjoy fraud content on
          multiple devices.
        </Alert>
      );
    } else {
      loggedOutAlert = (
        <Alert severity='success' className={styles.loggedOutAlert} onClose={() => setJustLoggedOut(null)}>
          {ACCOUNT_SHARING_COPY.logoutSuccess}
        </Alert>
      );
    }
  }

  return (
    <UseCaseWrapper
      useCase={USE_CASES.accountSharing}
      embed={embed}
      onReset={() => {
        setJustLoggedOut(null);
        setOtherDevice(null);
        setCurrentLoginResponse(null);
      }}
    >
      <div className={formStyles.wrapper}>
        {loggedOutAlert}
        <h3 className={styles.formTitle}>
          {mode === 'signup' ? 'Sign up for ' : 'Log in to '}
          <span>FraudFlix</span>
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === 'signup') {
              createAccount({ username, password });
            } else {
              login({ username, password });
            }
          }}
          className={classNames(formStyles.useCaseForm, styles.accountSharingForm)}
        >
          {currentLoginResponse?.otherDevice ? challengeMarkup : mode === 'signup' ? signUpMarkup : loginMarkup}
        </form>
      </div>
    </UseCaseWrapper>
  );
};
