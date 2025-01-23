<p align="center">
  <a href="https://fingerprint.com">
    <picture>
     <source media="(prefers-color-scheme: dark)" srcset="https://fingerprintjs.github.io/home/resources/logo_light.svg" />
     <source media="(prefers-color-scheme: light)" srcset="https://fingerprintjs.github.io/home/resources/logo_dark.svg" />
     <img src="https://fingerprintjs.github.io/home/resources/logo_dark.svg" alt="Fingerprint logo" width="312px" />
   </picture>
  </a>
</p>
<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/:license-mit-blue.svg" alt="MIT license"></a>
<a href="https://discord.gg/39EpE2neBg"><img src="https://img.shields.io/discord/852099967190433792?style=logo&label=Discord&logo=Discord&logoColor=white" alt="Discord server"></a>
</p>

# Fingerprint Pro Use Cases

This repository demonstrates various use cases for [Fingerprint Pro](https://fingerprint.com) — a browser and device identity platform with 99.5% accuracy. Each scenario covers frontend and backend sample implementation with a persistent data layer. A live demo of each use case is available at [demo.fingerprint.com](https://demo.fingerprint.com/).
You can learn more about these use cases on our [website](https://fingerprint.com/use-cases).

## How to run

1. `yarn install`
2. `yarn dev`

Alternatively, you can use [CodeSandbox](https://codesandbox.io/p/devbox/github/fingerprintjs/fingerprintjs-pro-use-cases/) to run the project in your browser.

## Use cases

### Coupon & Promo Abuse

Prevent visitors from using a promo code multiple times. Protect yourself from customers abusing your promotional campaigns and increase sales.

[🎟 Coupon & Promo Abuse Live Demo](https://demo.fingerprint.com/coupon-fraud)  
[📖 Coupon & Promo Abuse Article](https://fingerprint.com/blog/prevent-coupon-promo-abuse-increase-sales/)

### Credential Stuffing

Protect your login page from repeated attempts to log in with stolen credentials and other account takeover threats. Without compromising the user experience of legitimate users.

[🔐 Credential Stuffing Live Demo](https://demo.fingerprint.com/credential-stuffing)  
[📖 Credential Stuffing Article](https://fingerprint.com/blog/stop-credential-stuffing/)

### Loan Risk

Detect fraudulent loan applications submitted by previously rejected applicants. Even when they are not logged in or use a VPN/Incognito mode.

[🧾 Loan Risk Live Demo](https://demo.fingerprint.com/loan-risk)  
[📖 Loan Risk Article](https://fingerprint.com/blog/detect-repeat-applications-loan-risk/)

### Payment Fraud

Protect your checkout from the use of stolen credit cards, chargebacks, and other payment fraud threats.

[💵 Payment Fraud Live Demo](https://demo.fingerprint.com/payment-fraud)  
[📖 Payment Fraud Article](https://fingerprint.com/blog/reducing-payment-fraud-with-reliable-visitor-identification/)

### Paywall

Protect your content and build a paywall that actually works. Prevent visitors from resetting their free content quota by clearing cookies, going incognito, or using a VPN.

[🗞 Paywall Live Demo](https://demo.fingerprint.com/paywall)  
[📖 Paywall Article](https://fingerprint.com/blog/how-paywalls-work-paywall-protection-tutorial/)

### Personalization

Provide a tailored experience to your visitors without forcing them to create an account. Remember search history, user preferences, or abandoned shopping cart items months after their last visit.

[🙋‍♀️ Personalization Live Demo](https://demo.fingerprint.com/personalization)  
[📖 Personalization Article](https://fingerprint.com/blog/providing-personalization-to-anonymous-users/)

### Content Scraping

Protect the content on your website from theft by reliably detecting even sophisticated bots and browser automation tools.

[🦾 Content Scraping Live Demo](https://demo.fingerprint.com/web-scraping)  
[📖 Content Scraping Article](https://fingerprint.com/blog/preventing-content-scraping/)

### Bot-detection-powered Firewall

Integrate Fingerprint Bot Detection with your Web Application Firewall and dynamically block IP addresses linked to past bot visits.

[🔥🧱 Bot Firewall Live Demo](https://demo.fingerprint.com/bot-firewall)  
[📖 Bot Firewall Article](https://fingerprint.com/blog/bot-detection-powered-application-firewall/)

### SMS Pumping Fraud Protection

Prevent financial losses from SMS pumping. Link every verification text message to a browser fingerprint and limit the number of verification requests from a single browser.

[📱 SMS Pumping Protection Live Demo](https://demo.fingerprint.com/sms-pumping)  
[📖 SMS Pumping Protection Article](https://fingerprint.com/blog/what-is-sms-fraud-prevention-tutorial/)

### VPN Detection and Location Spoofing Protection

Detect when visitors are using VPN to access your application. Prevent people spoofing their location from accessing geo-restricted content or pricing.

[🌍 VPN Detection Live Demo](https://demo.fingerprint.com/vpn-detection)  
[📖 VPN Detection Article](https://fingerprint.com/blog/vpn-detection-location-spoofing-fraud-prevention/)

### Account Sharing Prevention

Detect when multiple devices are using the same account. Prevent people from sharing their account with others.

[👥 Account Sharing Prevention Live Demo](https://demo.fingerprint.com/account-sharing)  
[📖 Account Sharing Prevention Article](https://fingerprint.com/blog/prevent-coupon-promo-abuse-increase-sales/)

## Documentation and Support

To dive deeper into Fingerprint Pro, see our [Documentation](https://dev.fingerprint.com/docs). For questions or suggestions specific to this repository, you can [create an issue](https://github.com/fingerprintjs/fingerprintjs-pro-use-cases/issues/new). For general questions and community vibes, visit our [Discord server](https://discord.gg/39EpE2neBg). If you require private support, you can email us at [oss-support@fingerprint.com](mailto:oss-support@fingerprint.com).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more information.
