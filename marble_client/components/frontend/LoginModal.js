"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import getApiKeyByDomain from "@/configs/getApiKey";
import OtpDigitInputs, { OTP_LENGTH } from "@/components/frontend/OtpDigitInputs";
import {
  getStorefrontPublicRoute,
  registerRoute,
  sendOtpRoute,
} from "@/utils/apiRoutes";
import { getLocalizedLabel } from "@/utils/localizedContent";
import {
  isStrongPassword,
  STRONG_PASSWORD_MESSAGE,
} from "@/utils/passwordPolicy";

export default function LoginModal({ language = "en" }) {
  const pathname = usePathname() || "/";
  const apiKey = getApiKeyByDomain();
  const t = (labelKey, fallback) =>
    getLocalizedLabel(labelKey, language, fallback);

  const [otpLoginEnabled, setOtpLoginEnabled] = useState(false);
  const [strongPasswordEnabled, setStrongPasswordEnabled] = useState(false);
  const [authModeLoaded, setAuthModeLoaded] = useState(false);

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginOtpId, setLoginOtpId] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginStep, setLoginStep] = useState("credentials"); // credentials | otp
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupOtpId, setSignupOtpId] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [signupStep, setSignupStep] = useState("credentials");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const callbackUrl = pathname;
  const apiHeaders = { "X-API-KEY": apiKey };

  useEffect(() => {
    let active = true;
    axios
      .get(getStorefrontPublicRoute, { headers: apiHeaders })
      .then((res) => {
        if (!active) return;
        setOtpLoginEnabled(Boolean(res.data?.data?.otp_login_enabled));
        setStrongPasswordEnabled(
          Boolean(res.data?.data?.strong_password_enabled),
        );
      })
      .catch(() => {
        if (!active) return;
        setOtpLoginEnabled(false);
        setStrongPasswordEnabled(false);
      })
      .finally(() => {
        if (active) setAuthModeLoaded(true);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishSignIn = async (credentials) => {
    const result = await signIn("credentials", {
      ...credentials,
      apiKey,
      redirect: false,
    });
    if (result?.error) {
      throw new Error(t("lblInvalidLogin", "Invalid login"));
    }
    window.location.href = callbackUrl;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginPhone) {
      setLoginError(t("lblRequiredFields", "Please fill required fields"));
      return;
    }

    setLoginLoading(true);
    try {
      if (otpLoginEnabled) {
        if (loginStep === "credentials") {
          const res = await axios.post(
            sendOtpRoute,
            { phone_number: loginPhone, purpose: "login" },
            { headers: apiHeaders },
          );
          setLoginOtpId(String(res.data?.otp_id || ""));
          setLoginCode("");
          setLoginStep("otp");
          return;
        }

        if (loginCode.length !== OTP_LENGTH || !loginOtpId) {
          setLoginError(t("lblEnterOtp", "Enter OTP"));
          return;
        }

        await finishSignIn({
          phone_number: loginPhone,
          otp_id: loginOtpId,
          code: loginCode,
          purpose: "login",
          auth_mode: "otp",
        });
        return;
      }

      if (!loginPassword) {
        setLoginError(t("lblRequiredFields", "Please fill required fields"));
        return;
      }

      await finishSignIn({
        phone_number: loginPhone,
        password: loginPassword,
        auth_mode: "password",
      });
    } catch (error) {
      setLoginError(
        error?.response?.data?.message ||
          error?.message ||
          t("lblErrorOccurred", "An error occurred"),
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");

    if (!signupName || !signupPhone) {
      setSignupError(t("lblRequiredFields", "Please fill required fields"));
      return;
    }

    setSignupLoading(true);
    try {
      if (otpLoginEnabled) {
        if (signupStep === "credentials") {
          const res = await axios.post(
            sendOtpRoute,
            { phone_number: signupPhone, purpose: "register" },
            { headers: apiHeaders },
          );
          setSignupOtpId(String(res.data?.otp_id || ""));
          setSignupCode("");
          setSignupStep("otp");
          return;
        }

        if (signupCode.length !== OTP_LENGTH || !signupOtpId) {
          setSignupError(t("lblEnterOtp", "Enter OTP"));
          return;
        }

        await finishSignIn({
          phone_number: signupPhone,
          full_name: signupName,
          otp_id: signupOtpId,
          code: signupCode,
          purpose: "register",
          auth_mode: "otp",
        });
        return;
      }

      if (!signupPassword || signupPassword.length < 6) {
        setSignupError(
          t("lblPasswordMinLength", "Password must be at least 6 characters"),
        );
        return;
      }

      if (strongPasswordEnabled && !isStrongPassword(signupPassword)) {
        setSignupError(STRONG_PASSWORD_MESSAGE);
        return;
      }

      await axios.post(
        registerRoute,
        {
          full_name: signupName,
          phone_number: signupPhone,
          password: signupPassword,
        },
        { headers: apiHeaders },
      );

      await finishSignIn({
        phone_number: signupPhone,
        password: signupPassword,
        auth_mode: "password",
      });
    } catch (error) {
      setSignupError(
        error?.response?.data?.message ||
          error?.message ||
          t("lblErrorOccurred", "An error occurred"),
      );
    } finally {
      setSignupLoading(false);
    }
  };

  const resetLoginOtp = () => {
    setLoginStep("credentials");
    setLoginOtpId("");
    setLoginCode("");
    setLoginError("");
  };

  const resetSignupOtp = () => {
    setSignupStep("credentials");
    setSignupOtpId("");
    setSignupCode("");
    setSignupError("");
  };

  return (
    <>
      <div
        className="modal login-modal"
        id="myModal"
        aria-labelledby="loginModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 position-relative justify-content-center">
              <img
                src="/assets/images/Logo-login.png"
                className="img-fluid login-logo"
                alt={t("lblLogoAlt", "Logo")}
              />
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 me-3 mt-3"
                data-bs-dismiss="modal"
                aria-label={t("lblClose", "Close")}
              ></button>
            </div>
            <p
              id="loginModalLabel"
              className="text-center font-brandon-bold text-brown fs-20"
            >
              {t("lblLoginStarted", "Let's get started")}
            </p>
            <div className="mb-3 d-flex align-items-center p-1 gap-2 justify-content-center bg-outline-primary w-75 rounded-5 mx-auto">
              <div
                className="login-action-height bg-blue rounded-5 w-50 text-center py-2 d-flex align-items-center justify-content-center"
                role="button"
                data-bs-toggle="modal"
                data-bs-target="#myModal"
              >
                <span className="text-white font-brandon-bold">
                  {t("lblLogin", "Login")}
                </span>
              </div>
              <div
                className="login-action-height bg-white rounded-5 w-50 text-center py-2 d-flex align-items-center justify-content-center"
                role="button"
                data-bs-toggle="modal"
                data-bs-target="#signinModal"
              >
                <span className="fw-bold text-blue">
                  {t("lblSignup", "Sign up")}
                </span>
              </div>
            </div>

            {!authModeLoaded ? (
              <p className="text-center text-secondary small">
                {t("lblLoading", "Loading...")}
              </p>
            ) : (
              <form onSubmit={handleLoginSubmit}>
                {!(otpLoginEnabled && loginStep === "otp") ? (
                  <input
                    type="tel"
                    className="form-control mb-2 w-75 mx-auto rounded-5 mt-3"
                    placeholder={t("lblEnterPhone", "Enter phone number")}
                    aria-label={t("lblPhoneNumber", "Phone number")}
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                  />
                ) : (
                  <div className="verification-code text-center mt-3">
                    <label className="control-label font-brandon-bold">
                      {t("lblEnterOtp", "Enter verification code")}
                    </label>
                    <p className="text-secondary small mb-0">
                      {t("lblOtpSent", "OTP sent to")} {loginPhone}
                    </p>
                    <OtpDigitInputs
                      idPrefix="login_otp"
                      value={loginCode}
                      onChange={setLoginCode}
                      disabled={loginLoading}
                    />
                  </div>
                )}
                {!otpLoginEnabled ? (
                  <input
                    type="password"
                    className="form-control mb-3 w-75 mx-auto rounded-5"
                    placeholder={t("lblEnterPassword", "Enter password")}
                    aria-label={t("lblPassword", "Password")}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                ) : null}
                {loginError ? (
                  <p className="text-danger text-center small px-4">
                    {loginError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="btn bg-blue mt-3 mx-auto rounded-5 w-75 text-center p-3 text-white font-brandon-bold d-block"
                  disabled={loginLoading}
                >
                  {loginLoading
                    ? t("lblLoading", "Loading...")
                    : otpLoginEnabled && loginStep === "credentials"
                      ? t("lblSendOtp", "Send OTP")
                      : t("lblContinue", "Continue")}
                </button>
                {otpLoginEnabled && loginStep === "otp" ? (
                  <button
                    type="button"
                    className="btn btn-link d-block mx-auto mt-2 text-blue"
                    onClick={resetLoginOtp}
                  >
                    {t("lblChangePhone", "Change phone")}
                  </button>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>

      <div
        className="modal login-modal"
        id="signinModal"
        aria-labelledby="signUpModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 position-relative justify-content-center">
              <img
                src="/assets/images/Logo-login.png"
                className="img-fluid login-logo"
                alt={t("lblLogoAlt", "Logo")}
              />
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 me-3 mt-3"
                data-bs-dismiss="modal"
                aria-label={t("lblClose", "Close")}
              ></button>
            </div>
            <p
              id="signUpModalLabel"
              className="text-center font-brandon-bold text-brown fs-20"
            >
              {t("lblLoginStarted", "Let's get started")}
            </p>
            <div className="mb-3 d-flex align-items-center p-1 gap-2 justify-content-center bg-outline-primary w-75 rounded-5 mx-auto">
              <div
                className="login-action-height bg-white rounded-5 w-50 text-center py-2 d-flex align-items-center justify-content-center"
                role="button"
                data-bs-toggle="modal"
                data-bs-target="#myModal"
              >
                <span className="fw-bold text-blue">
                  {t("lblLogin", "Login")}
                </span>
              </div>
              <div
                className="login-action-height bg-blue rounded-5 w-50 text-center py-2 d-flex align-items-center justify-content-center"
                role="button"
                data-bs-toggle="modal"
                data-bs-target="#signinModal"
              >
                <span className="text-white font-brandon-bold">
                  {t("lblSignup", "Sign up")}
                </span>
              </div>
            </div>

            {!authModeLoaded ? (
              <p className="text-center text-secondary small">
                {t("lblLoading", "Loading...")}
              </p>
            ) : (
              <form onSubmit={handleSignupSubmit}>
                {!(otpLoginEnabled && signupStep === "otp") ? (
                  <>
                    <input
                      type="text"
                      className="form-control w-75 mx-auto rounded-5 mt-3"
                      placeholder={t("lblEnterName", "Enter full name")}
                      aria-label={t("lblFullName", "Full name")}
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                    <input
                      type="tel"
                      className="form-control mb-2 w-75 mx-auto rounded-5 mt-2"
                      placeholder={t("lblEnterPhone", "Enter phone number")}
                      aria-label={t("lblPhoneNumber", "Phone number")}
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                    />
                  </>
                ) : (
                  <div className="verification-code text-center mt-3">
                    <label className="control-label font-brandon-bold">
                      {t("lblEnterOtp", "Enter verification code")}
                    </label>
                    <p className="text-secondary small mb-0">
                      {t("lblOtpSent", "OTP sent to")} {signupPhone}
                    </p>
                    <OtpDigitInputs
                      idPrefix="signup_otp"
                      value={signupCode}
                      onChange={setSignupCode}
                      disabled={signupLoading}
                    />
                  </div>
                )}
                {!otpLoginEnabled ? (
                  <>
                    <input
                      type="password"
                      className="form-control mb-2 w-75 mx-auto rounded-5"
                      placeholder={t("lblEnterPassword", "Enter password")}
                      aria-label={t("lblPassword", "Password")}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    {strongPasswordEnabled ? (
                      <p className="text-secondary text-center small px-4 mb-2">
                        {STRONG_PASSWORD_MESSAGE}
                      </p>
                    ) : null}
                  </>
                ) : null}
                {signupError ? (
                  <p className="text-danger text-center small px-4">
                    {signupError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="btn bg-blue mt-3 mx-auto rounded-5 w-75 text-center p-3 text-white font-brandon-bold d-block"
                  disabled={signupLoading}
                >
                  {signupLoading
                    ? t("lblLoading", "Loading...")
                    : otpLoginEnabled && signupStep === "credentials"
                      ? t("lblSendOtp", "Send OTP")
                      : t("lblContinue", "Continue")}
                </button>
                {otpLoginEnabled && signupStep === "otp" ? (
                  <button
                    type="button"
                    className="btn btn-link d-block mx-auto mt-2 text-blue"
                    onClick={resetSignupOtp}
                  >
                    {t("lblChangePhone", "Change phone")}
                  </button>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
