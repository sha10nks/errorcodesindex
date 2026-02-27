import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const outRoot = path.join(repoRoot, 'src', 'content', 'systemCodes');

const now = new Date().toISOString();

const SUBS = {
  'operating-systems': {
    systemLabel: 'Operating Systems',
    whereSeen: [
      'OS update or installer workflows',
      'System dialogs or setup screens',
      'Application install, launch, or repair operations',
      'Built-in troubleshooting tools and logs',
    ],
    whyAppears: [
      'The OS blocked an operation due to missing requirements',
      'A file, component, or dependency was missing or corrupted',
      'A path, permission, or configuration check failed',
      'A required service or network step did not complete',
    ],
    happensNext: ['The operation fails or rolls back', 'A log entry is recorded', 'The system remains usable but the task does not complete'],
    notThis: ['It is not automatically a hardware failure', 'It is not proof of account enforcement by a third-party service'],
    troubleshooting: [
      'Retry after a restart to clear transient locks',
      'Confirm free disk space and basic system health',
      'Verify time and time zone for certificate-based operations',
      'Check the closest relevant log source for more detail',
      'Avoid deleting system files; use built-in repair tools instead',
      'If the code persists after safe checks, use official support paths',
    ],
    notes: ['The same code can appear in multiple contexts; the surrounding message and log source matter.'],
  },
  'business-systems': {
    systemLabel: 'Business Systems',
    whereSeen: ['Sign-in, licensing, or activation flows', 'Company file or dataset access steps', 'Multi-user or hosted setups', 'Sync or update operations'],
    whyAppears: [
      'A required service, permission, or configuration step failed',
      'A file or database resource could not be opened reliably',
      'Network name resolution or connectivity was interrupted',
      'The product detected a validation or state mismatch',
    ],
    happensNext: ['The workflow stops and prompts for retry', 'A limited error message is shown to the user', 'Support logs may contain the full cause'],
    notThis: ['It is not the same as a payment network response code', 'It is not guaranteed to be a data loss event'],
    troubleshooting: [
      'Confirm the product version and the exact code/message shown',
      'Check whether the issue occurs on one device or for all users',
      'Verify file paths, permissions, and required services are running',
      'Confirm network stability if multi-user or hosted',
      'Retry after a controlled restart of the application and host services',
      'If the issue persists, follow vendor support guidance with logs',
    ],
    notes: ['Many business codes are intentionally non-specific; context and logs are required for precise diagnosis.'],
  },
  'pos-systems': {
    systemLabel: 'POS Systems',
    whereSeen: ['Checkout and payment attempts', 'Settlement and batch close workflows', 'Device pairing or peripheral setup', 'POS sync and configuration screens'],
    whyAppears: [
      'A payment decision was returned by issuer/processor',
      'Connectivity or configuration prevented completing the transaction',
      'A device or service dependency was unavailable',
    ],
    happensNext: ['The POS shows an error or decline message', 'The transaction is not completed as requested', 'The system may allow retry after the underlying issue is resolved'],
    notThis: ['It is not a guarantee of fraud', 'It is not always a hardware failure'],
    troubleshooting: [
      'Confirm whether the message is a decline or a technical error',
      'Avoid repeated retries if you are unsure whether a charge succeeded',
      'Verify internet connectivity and service status',
      'Check the processor record for the authoritative final state',
      'Confirm terminal and POS configuration (TID/MID, pairing)',
      'Escalate to vendor/processor support for repeated failures',
    ],
    notes: ['POS workflows span multiple layers; the same message can surface from different causes.'],
  },
  'security-systems': {
    systemLabel: 'Security Systems',
    whereSeen: ['Login and authentication prompts', 'Privilege elevation or policy checks', 'Certificate or token validation failures', 'Security product or OS enforcement dialogs'],
    whyAppears: ['Credentials, tokens, or policies did not validate', 'An account state (locked/disabled/expired) prevented access', 'Time/certificate validation failed', 'A security control blocked the requested operation'],
    happensNext: ['Access is denied and the operation stops', 'An audit log entry is created', 'A retry may succeed after policy/account issues are resolved'],
    notThis: ['It is not safe to bypass security controls to test', 'It is not always a network outage'],
    troubleshooting: [
      'Confirm the exact code and the context where it appears',
      'Verify time and time zone for certificate-based authentication',
      'Check account status (locked, disabled, expired) if applicable',
      'Review the relevant audit logs for the real reason',
      'Avoid disabling security products as a troubleshooting step',
      'Use official admin and vendor remediation procedures',
    ],
    notes: ['Security systems may intentionally hide detail; logs are typically the authoritative explanation.'],
  },
  printers: {
    systemLabel: 'Printers',
    whereSeen: ['Printer display panels or status lights', 'Driver and print queue dialogs', 'Maintenance and service screens', 'During firmware updates or job processing'],
    whyAppears: ['A mechanical or consumable condition prevented printing', 'Firmware/job processing hit an internal fault state', 'Communication between host and printer failed', 'A required component reported an out-of-range state'],
    happensNext: ['Printing pauses or stops', 'The printer may request service or a reset', 'The error may persist until the underlying condition is cleared'],
    notThis: ['It is not always a permanent hardware failure', 'It is not necessarily caused by the computer or driver'],
    troubleshooting: [
      'Check whether the code appears on the printer itself or only on the computer',
      'Power-cycle the printer after clearing obvious paper/consumable issues',
      'Clear the print queue and retry a small test print',
      'Confirm the printer firmware and driver are up to date',
      'If the device reports a service error repeatedly, follow official support guidance',
      'Avoid disassembly unless explicitly instructed by the manufacturer',
    ],
    notes: ['Many printer codes are model-family specific; confirm the exact model when comparing documentation.'],
  },
  routers: {
    systemLabel: 'Routers',
    whereSeen: ['WAN/PPP connection attempts', 'Device network status dialogs', 'ISP authentication and session setup', 'After modem/router restarts or configuration changes'],
    whyAppears: ['PPP authentication or negotiation failed', 'The WAN link could not be established', 'Name resolution or DHCP assignment failed', 'A modem/router configuration mismatch prevented connectivity'],
    happensNext: ['Internet access is unavailable', 'Devices may connect locally but not reach the WAN', 'Retry may succeed after restoring the failing layer'],
    notThis: ['It is not always a router hardware defect', 'It is not always caused by the ISP'],
    troubleshooting: [
      'Confirm whether the issue affects one device or the whole network',
      'Restart in order: modem (if present) → router → affected device',
      'Check WAN status lights and the router status page if available',
      'Verify credentials and connection type (e.g., PPPoE) if applicable',
      'Test name resolution by trying a different DNS setting if appropriate',
      'If the issue persists, contact ISP or router vendor with the full error',
    ],
    notes: ['Some “router” errors are shown by the device OS or connection stack, not the router UI itself.'],
  },
  'pos-terminals': {
    systemLabel: 'POS Terminals',
    whereSeen: ['Card-present checkout prompts', 'Settlement and batch close operations', 'Terminal pairing and configuration screens', 'During terminal software or key updates'],
    whyAppears: ['A payment decision was returned by the issuer/processor', 'Connectivity prevented reaching the host', 'Device configuration or keys were incomplete', 'A local device state blocked completion (paper out, update required)'],
    happensNext: ['The terminal displays a prompt and aborts the flow', 'The POS may ask to retry or use a different method', 'Final status must be confirmed in the processor record'],
    notThis: ['It is not always a decline', 'It is not safe to re-run a card without checking for duplicates'],
    troubleshooting: [
      'Determine whether the message is a decline or a technical failure',
      'Confirm connectivity (Ethernet/Wi‑Fi/cellular) and signal quality',
      'Check for required updates or key loading status',
      'Confirm batch/settlement state if the error appears at close',
      'Verify merchant configuration identifiers (TID/MID) if shown',
      'Escalate with logs/receipts to the terminal vendor or processor',
    ],
    notes: ['Terminal prompts vary by device and processor; the most reliable source of truth is the processor’s final record.'],
  },
  'smart-devices': {
    systemLabel: 'Smart Devices',
    whereSeen: ['Device onboarding and pairing steps', 'Wi‑Fi join attempts', 'Firmware or app updates', 'Account linking and cloud authentication'],
    whyAppears: ['The device could not complete setup or reach the service', 'Wi‑Fi credentials or band settings prevented joining', 'A vendor service outage blocked authentication', 'An update download or apply step failed'],
    happensNext: ['Setup may pause and request retry', 'The device may show offline status', 'A retry may succeed after network or service recovery'],
    notThis: ['It is not always a defective device', 'It is not always a home network outage'],
    troubleshooting: [
      'Confirm the device is on a compatible network (often 2.4GHz)',
      'Check whether the vendor service is experiencing an outage',
      'Retry setup after restarting the device and the controlling app',
      'Test on a different network to isolate router-specific issues',
      'Ensure firmware updates complete without interruption',
      'Use official support if the device repeats the same error consistently',
    ],
    notes: ['Short numeric codes are often vendor-specific; ensure the code belongs to your exact platform.'],
  },
  'bios-uefi': {
    systemLabel: 'BIOS / UEFI',
    whereSeen: ['During POST at startup', 'Firmware security checks (TPM/Secure Boot)', 'Boot device selection and initialization', 'Hardware monitoring screens'],
    whyAppears: ['A required component did not initialize correctly', 'Boot configuration could not find a valid device', 'Security policy blocked boot', 'Firmware detected a health or configuration issue'],
    happensNext: ['Boot may stop or loop at startup', 'A firmware message is displayed', 'The system may enter recovery or setup screens'],
    notThis: ['It is not safe to guess at hardware fixes', 'It is not always solved by a firmware update'],
    troubleshooting: [
      'Record the exact message and the device model',
      'Check official documentation for the specific OEM mapping',
      'Confirm boot order and whether the expected drive is detected',
      'Verify date/time settings if security validation is failing',
      'Avoid hardware disassembly unless qualified and instructed',
      'Use vendor support pathways for repeat boot failures',
    ],
    notes: ['Firmware messages and beep codes vary significantly by vendor and model.'],
  },
  'embedded-systems': {
    systemLabel: 'Embedded Systems',
    whereSeen: ['Device status screens or logs', 'During startup or initialization sequences', 'While interacting with sensors, buses, or storage', 'After firmware updates or configuration changes'],
    whyAppears: ['A safety check or assertion failed', 'The system restarted due to watchdog or power conditions', 'A bus, peripheral, or storage operation failed', 'A resource limit was reached (memory/stack)'],
    happensNext: ['The device may reboot or enter a fault state', 'A diagnostic message is logged', 'Service intervention may be required for field equipment'],
    notThis: ['It is not always user-repairable', 'It is not safe to perform electrical repairs based on guesses'],
    troubleshooting: [
      'Capture the full log output, including any stack trace or code',
      'Confirm firmware version and recent configuration changes',
      'Check power stability and environmental conditions',
      'Isolate peripherals and buses if the fault indicates I/O',
      'Use vendor diagnostics and service manuals for the exact model',
      'Escalate when the fault is recurring or safety-critical',
    ],
    notes: ['Embedded error identifiers are frequently product-specific; the exact device documentation is critical.'],
  },
};

const CODES = {
  'operating-systems': [
    {
      slug: '0x80070005',
      code: '0x80070005',
      shortLabel: 'Access denied',
      summary: 'An OS access control check blocked the requested operation.',
      whatMeans:
        '0x80070005 is commonly used to indicate an access denied result. The OS refused the operation because the caller did not have the required permissions or a protected resource could not be accessed. The code describes a permission decision, not a specific application bug.',
    },
    {
      slug: '0x80004005',
      code: '0x80004005',
      shortLabel: 'Unspecified error',
      summary: 'A generic failure occurred and the system did not expose a specific reason.',
      whatMeans:
        '0x80004005 is a generic “unspecified error” value used when a component reports failure without a more precise mapping. It often appears when the underlying failure is wrapped by another layer, so the surrounding message and logs are needed to narrow it down.',
    },
    {
      slug: '0x80070002',
      code: '0x80070002',
      shortLabel: 'File not found',
      summary: 'A required file could not be located at the expected path.',
      whatMeans:
        '0x80070002 commonly indicates that a required file was not found. The operation expected a file at a specific path or location, but it was missing, moved, or inaccessible. The code is often tied to install, update, or configuration steps.',
    },
    {
      slug: '0x80070003',
      code: '0x80070003',
      shortLabel: 'Path not found',
      summary: 'A required directory or path was missing or not reachable.',
      whatMeans:
        '0x80070003 commonly indicates that a required path was not found. The directory or location referenced by the operation does not exist, is not mounted, or is not reachable under the current context. It is frequently seen in installer and update workflows.',
    },
    {
      slug: '0x80070057',
      code: '0x80070057',
      shortLabel: 'Parameter incorrect',
      summary: 'An operation failed because an input value was invalid for the requested action.',
      whatMeans:
        '0x80070057 is commonly used to indicate an invalid parameter. A component rejected the operation because an input value, path, or state was not acceptable. It often requires checking the exact operation and any accompanying message for the rejected parameter.',
    },
    {
      slug: '0x80070490',
      code: '0x80070490',
      shortLabel: 'Element not found',
      summary: 'A required component or referenced item was not found in the expected state.',
      whatMeans:
        '0x80070490 is commonly associated with “element not found.” The system expected to locate a component, record, or dependency but could not. It is frequently reported during updates or component servicing when required items are missing or inconsistent.',
    },
    {
      slug: '0x800f081f',
      code: '0x800f081f',
      shortLabel: 'Source files not found',
      summary: 'A repair or update operation could not locate the required source components.',
      whatMeans:
        '0x800f081f commonly indicates that required source files could not be found for a repair or servicing operation. It can occur when optional features or component repairs require files that are not available locally or from the configured source.',
    },
    {
      slug: '0x80073712',
      code: '0x80073712',
      shortLabel: 'Component store corruption',
      summary: 'A servicing operation failed because required system components were missing or inconsistent.',
      whatMeans:
        '0x80073712 is commonly tied to servicing/component store issues. The system reported that a required component file or manifest was missing or corrupted, preventing an update or repair operation from completing successfully.',
    },
    {
      slug: '0x8024402f',
      code: '0x8024402f',
      shortLabel: 'Update connection failure',
      summary: 'An update workflow failed to complete a required network step.',
      whatMeans:
        '0x8024402f is commonly seen when an update workflow cannot complete a required network request. The code is often associated with connection interruptions, proxy configuration issues, or service reachability problems during update checks or downloads.',
    },
    {
      slug: '0xc000007b',
      code: '0xc000007b',
      shortLabel: 'Invalid image format',
      summary: 'A program failed to start because required binaries were incompatible or invalid.',
      whatMeans:
        '0xC000007B is commonly associated with an “invalid image format” condition during application startup. It often indicates a mismatch between 32-bit and 64-bit components or an invalid dependency binary, preventing the program from loading correctly.',
    },
  ],
  'business-systems': [
    {
      slug: '6000-83',
      code: '6000 -83',
      shortLabel: 'Company file access error',
      summary: 'A business application could not open the requested company file or dataset.',
      whatMeans:
        'Error 6000 -83 is commonly associated with failing to open a company file in certain accounting software workflows. It indicates the application could not access or validate the target file state. The root cause is typically file access, hosting configuration, or environment state rather than a single transaction issue.',
    },
    {
      slug: 'h202',
      code: 'H202',
      shortLabel: 'Multi-user hosting connection issue',
      summary: 'A multi-user setup could not reach the host or required service to open the shared file.',
      whatMeans:
        'H202 is widely recognized as a multi-user hosting connectivity issue in business accounting deployments. It generally indicates that a workstation cannot communicate with the host computer or the required hosting services to access a shared company file.',
    },
    {
      slug: 'h505',
      code: 'H505',
      shortLabel: 'Host configuration problem',
      summary: 'The client could not complete multi-user access because the host configuration was not acceptable.',
      whatMeans:
        'H505 is commonly associated with host-side configuration preventing a workstation from accessing a shared company file in multi-user mode. It typically points to hosting settings, network name resolution, or required services not being reachable as expected.',
    },
    {
      slug: '3371',
      code: '3371',
      shortLabel: 'License/component initialization failure',
      summary: 'The application could not initialize a required licensing or component state needed to start.',
      whatMeans:
        'Error 3371 is commonly referenced as an initialization problem involving required components used during application startup. It can present when a licensing-related component, local state, or dependency fails to initialize, preventing normal launch behavior.',
    },
    {
      slug: 'ps038',
      code: 'PS038',
      shortLabel: 'Payroll update blocked',
      summary: 'A payroll update workflow was blocked by a pending or inconsistent submission state.',
      whatMeans:
        'PS038 is commonly associated with payroll update failures where a pending or unsent payroll submission prevents completing an update cycle. The code indicates the workflow cannot proceed until the underlying state is resolved in the product’s update flow.',
    },
    {
      slug: '-6123-0',
      code: '-6123,0',
      shortLabel: 'Company file open failed',
      summary: 'The application could not open the company file due to environment or configuration issues.',
      whatMeans:
        'Error -6123,0 is commonly referenced when a business application cannot open a company file. It often indicates configuration, permissions, hosting mode, or environment state issues that prevent the file from being accessed reliably.',
    },
    {
      slug: '-6147-0',
      code: '-6147,0',
      shortLabel: 'Company file access problem',
      summary: 'The application could not access the company file at the specified location.',
      whatMeans:
        'Error -6147,0 is commonly associated with failing to access a company file. The code indicates that the file could not be opened at the referenced location, often due to permissions, path issues, or multi-user configuration conflicts.',
    },
    {
      slug: '-6073--99001',
      code: '-6073, -99001',
      shortLabel: 'Company file in use or blocked',
      summary: 'The application detected a state where the company file could not be opened due to locking or environment conditions.',
      whatMeans:
        'Error -6073, -99001 is commonly referenced when a company file cannot be opened due to locking, hosting, or environment constraints. It often indicates the file is in use, is hosted incorrectly, or the workstation cannot satisfy required access conditions.',
    },
    {
      slug: '6000-301',
      code: '6000 -301',
      shortLabel: 'Company file cannot be opened',
      summary: 'A company file open operation failed due to access or configuration conditions.',
      whatMeans:
        'Error 6000 -301 is commonly reported in company file open workflows and indicates the application could not open the file in its current environment. The cause is often related to hosting configuration, access rights, or file validation steps.',
    },
    {
      slug: '1904',
      code: '1904',
      shortLabel: 'Component registration failure',
      summary: 'An installation or setup workflow could not register a required component.',
      whatMeans:
        'Error 1904 is commonly seen during installation or setup when a required component fails to register correctly. It indicates the installer could not complete a registration step, often due to permissions, locked files, or system policy restrictions.',
    },
  ],
  'pos-systems': [
    {
      slug: '05',
      code: '05',
      shortLabel: 'Do not honor',
      summary: 'A card transaction was declined with a non-specific “do not honor” response.',
      whatMeans:
        'Response code 05 (“Do not honor”) is commonly used when the issuer declines a transaction without providing a specific reason to the merchant. It indicates the payment was not approved as requested, and the details are usually only available to the cardholder via the issuer.',
    },
    {
      slug: '12',
      code: '12',
      shortLabel: 'Invalid transaction',
      summary: 'The transaction type or requested operation was not accepted for processing.',
      whatMeans:
        'Response code 12 (“Invalid transaction”) is commonly used when the requested transaction type is not valid for the account, terminal, or processing context. It often indicates a mismatch between the transaction request and what the network or issuer expects.',
    },
    {
      slug: '13',
      code: '13',
      shortLabel: 'Invalid amount',
      summary: 'The transaction amount was not accepted by the processor or issuer.',
      whatMeans:
        'Response code 13 (“Invalid amount”) is commonly used when the transaction amount is formatted incorrectly or not acceptable for the requested operation. It can also occur when currency, limits, or amount validation rules reject the request.',
    },
    {
      slug: '14',
      code: '14',
      shortLabel: 'Invalid card number',
      summary: 'The card number failed validation or did not map to an acceptable account.',
      whatMeans:
        'Response code 14 (“Invalid card number”) indicates the primary account number (PAN) did not validate or was not recognized as acceptable for processing. It is a validation and identifier problem rather than a funds or network availability issue.',
    },
    {
      slug: '51',
      code: '51',
      shortLabel: 'Insufficient funds',
      summary: 'The issuer declined because the account did not have sufficient available funds or credit.',
      whatMeans:
        'Response code 51 (“Insufficient funds”) indicates the issuer determined the available balance or credit was not sufficient for the transaction amount. It is an issuer decision, not a terminal error.',
    },
    {
      slug: '54',
      code: '54',
      shortLabel: 'Expired card',
      summary: 'The card expiration date failed validation during authorization.',
      whatMeans:
        'Response code 54 (“Expired card”) indicates the card expiration date did not pass the issuer’s validation rules for authorization. It typically means the card is expired or the expiration date was entered incorrectly.',
    },
    {
      slug: '57',
      code: '57',
      shortLabel: 'Transaction not permitted',
      summary: 'The issuer declined because the transaction is not permitted for this account.',
      whatMeans:
        'Response code 57 (“Transaction not permitted to cardholder”) indicates the issuer will not permit the requested transaction type for the account. It is often tied to account restrictions, channel controls, or risk policies.',
    },
    {
      slug: '58',
      code: '58',
      shortLabel: 'Transaction not permitted (terminal)',
      summary: 'The transaction type was not permitted in the terminal or merchant configuration.',
      whatMeans:
        'Response code 58 (“Transaction not permitted to terminal”) indicates the transaction type is not allowed for the terminal or merchant setup. It can occur when a terminal is not enabled for a specific transaction capability.',
    },
    {
      slug: '91',
      code: '91',
      shortLabel: 'Issuer unavailable',
      summary: 'Authorization could not be completed because the issuer was unavailable.',
      whatMeans:
        'Response code 91 is commonly used when the issuer or issuer network is unavailable. The authorization could not be completed as requested at that moment, and a retry may succeed later depending on the outage state.',
    },
    {
      slug: '96',
      code: '96',
      shortLabel: 'System malfunction',
      summary: 'A processor or issuer system error prevented completing the transaction.',
      whatMeans:
        'Response code 96 (“System malfunction”) indicates a system problem occurred within the processing path. It is a technical failure category and usually requires retry or escalation to the processor if it persists.',
    },
  ],
  'security-systems': [
    {
      slug: '0xc000006d',
      code: '0xC000006D',
      shortLabel: 'Logon failure',
      summary: 'Authentication failed because credentials or required validation did not succeed.',
      whatMeans:
        '0xC000006D is widely recognized as a logon failure status used when authentication is not successful. It indicates the system did not accept the provided credentials or the login could not be validated under current policy.',
    },
    {
      slug: '0xc000006a',
      code: '0xC000006A',
      shortLabel: 'Wrong password',
      summary: 'Authentication failed because the provided password was not accepted.',
      whatMeans:
        '0xC000006A is commonly associated with an incorrect password condition during authentication. It indicates the credential presented did not match what the system expected for the account.',
    },
    {
      slug: '0xc0000234',
      code: '0xC0000234',
      shortLabel: 'Account locked out',
      summary: 'Authentication was blocked because the account is locked.',
      whatMeans:
        '0xC0000234 is commonly associated with an account lockout state. The account is blocked from authentication attempts until the lockout policy is cleared or the lockout period expires.',
    },
    {
      slug: '0xc0000072',
      code: '0xC0000072',
      shortLabel: 'Account disabled',
      summary: 'Authentication failed because the account is disabled.',
      whatMeans:
        '0xC0000072 is commonly associated with an account disabled state. The system refused authentication because the account is not enabled for login under current policy.',
    },
    {
      slug: '0xc0000193',
      code: '0xC0000193',
      shortLabel: 'Account expired',
      summary: 'Authentication failed because the account is expired.',
      whatMeans:
        '0xC0000193 is commonly associated with an account expiration state. The account is not valid for authentication because its configured validity window has ended.',
    },
    {
      slug: '0x8009030e',
      code: '0x8009030E',
      shortLabel: 'No credentials',
      summary: 'A security layer could not find credentials to complete authentication.',
      whatMeans:
        '0x8009030E is commonly used to indicate that no suitable credentials were available for the requested security operation. It can appear when a process expects a credential but none is present in the current context.',
    },
    {
      slug: '0x80090308',
      code: '0x80090308',
      shortLabel: 'Invalid token',
      summary: 'A security token or credential material was not accepted as valid.',
      whatMeans:
        '0x80090308 is commonly used when a security token is not accepted as valid. It indicates a validation failure in the security layer rather than a normal application error.',
    },
    {
      slug: '0x80090302',
      code: '0x80090302',
      shortLabel: 'Unknown credentials',
      summary: 'The security layer did not recognize the credential type or required material.',
      whatMeans:
        '0x80090302 is commonly associated with unknown credentials in a security context. The component could not recognize or use the provided credential type to complete the requested operation.',
    },
    {
      slug: '0x80090305',
      code: '0x80090305',
      shortLabel: 'Security internal error',
      summary: 'A security provider encountered an internal failure while processing the request.',
      whatMeans:
        '0x80090305 is commonly used to represent an internal error in a security provider. It indicates the security component could not complete the operation due to an internal failure state, often requiring logs to diagnose.',
    },
    {
      slug: '0x80072f8f',
      code: '0x80072F8F',
      shortLabel: 'Security error',
      summary: 'A certificate or secure connection validation step failed.',
      whatMeans:
        '0x80072F8F is commonly referenced as a security validation failure in secure connection scenarios. It can occur when certificate validation fails due to incorrect time settings or trust chain issues during a secure network operation.',
    },
  ],
  printers: [
    {
      slug: 'b200',
      code: 'B200',
      shortLabel: 'Printer error',
      summary: 'A printer reported a device fault state that stops printing.',
      whatMeans:
        'B200 is commonly referenced as a printer fault error on certain device families. It indicates the printer detected a condition that prevents normal operation and may require reset or service depending on persistence.',
    },
    {
      slug: '5b00',
      code: '5B00',
      shortLabel: 'Maintenance/service error',
      summary: 'A printer entered a maintenance or service-required state and stopped normal printing.',
      whatMeans:
        '5B00 is commonly referenced as a maintenance or service error on certain printer families. It indicates the device reached a state where maintenance operations are required before continuing normal printing.',
    },
    {
      slug: 'u052',
      code: 'U052',
      shortLabel: 'Cartridge recognition issue',
      summary: 'The printer could not recognize the installed ink cartridge correctly.',
      whatMeans:
        'U052 is commonly referenced when a printer cannot recognize an ink cartridge. It indicates a cartridge identification or compatibility issue that prevents printing until the cartridge state is resolved.',
    },
    {
      slug: '49-service-error',
      code: '49',
      shortLabel: 'Service error',
      summary: 'A printer firmware or job-processing failure caused the device to enter an error state.',
      whatMeans:
        '“49” is commonly associated with service errors on some printer lines. It is often tied to firmware/job processing faults that can be triggered by a specific print job, driver interaction, or device state.',
    },
    {
      slug: '50-4',
      code: '50.4',
      shortLabel: 'Fuser error',
      summary: 'A printer reported a fuser-related failure condition.',
      whatMeans:
        '50.4 is commonly associated with a fuser error condition on some laser printer families. It indicates a problem detected in the fuser subsystem, which can stop printing until resolved or serviced.',
    },
    {
      slug: '50-1',
      code: '50.1',
      shortLabel: 'Fuser warm-up error',
      summary: 'A printer reported a fuser warm-up or temperature-related fault state.',
      whatMeans:
        '50.1 is commonly associated with a fuser warm-up or temperature-related error on some laser printer families. It indicates the printer could not reach or maintain required fuser conditions during operation.',
    },
    {
      slug: '79-service-error',
      code: '79',
      shortLabel: 'Service error',
      summary: 'A printer reported a firmware or controller-level fault that stops printing.',
      whatMeans:
        '“79” is commonly associated with service errors on some printer families and can indicate a firmware or controller-level fault. The device may stop processing jobs until restarted or serviced, depending on cause and persistence.',
    },
    {
      slug: 'machine-error-46',
      code: 'Machine Error 46',
      shortLabel: 'Maintenance required',
      summary: 'The device indicated a maintenance counter or service condition needs attention.',
      whatMeans:
        '“Machine Error 46” is commonly referenced as a maintenance-required condition on certain printer families. It indicates a service or maintenance counter threshold that prevents normal operation until addressed using official procedures.',
    },
    {
      slug: 'e-01',
      code: 'E-01',
      shortLabel: 'Printer error',
      summary: 'A printer reported a general device error condition that stops operation.',
      whatMeans:
        'E-01 is commonly used as a general error identifier on some printer families. It indicates the device is in an error state and cannot continue until the underlying condition is cleared, often requiring checking the printer’s display and status.',
    },
    {
      slug: '59-f0',
      code: '59.F0',
      shortLabel: 'Internal error',
      summary: 'A printer reported an internal subsystem error that may require service.',
      whatMeans:
        '59.F0 is commonly referenced as an internal error code on certain printer families. It indicates the printer detected a fault condition that may require reset and, if persistent, official service diagnostics.',
    },
  ],
  routers: [
    {
      slug: 'error-651',
      code: 'Error 651',
      shortLabel: 'Connection failed',
      summary: 'A PPP connection attempt failed and the session could not be established.',
      whatMeans:
        'Error 651 is a common PPP connection message indicating the connection attempt failed and the session could not be established. It is typically associated with WAN/PPPoE connectivity and can involve ISP reachability, modem/router state, or device configuration.',
    },
    {
      slug: 'error-678',
      code: 'Error 678',
      shortLabel: 'No response',
      summary: 'The remote endpoint did not respond during a connection attempt.',
      whatMeans:
        'Error 678 is a common message indicating the remote computer did not respond during a connection attempt. It points to reachability issues along the WAN path, not a local Wi‑Fi association problem.',
    },
    {
      slug: 'error-691',
      code: 'Error 691',
      shortLabel: 'Access denied',
      summary: 'Authentication failed for a PPP connection, often due to credentials or permission.',
      whatMeans:
        'Error 691 commonly indicates a PPP authentication failure. The credentials were not accepted or the connection attempt was not permitted under the current configuration or account state.',
    },
    {
      slug: 'error-720',
      code: 'Error 720',
      shortLabel: 'PPP control failed',
      summary: 'A PPP control protocol could not be negotiated during connection setup.',
      whatMeans:
        'Error 720 commonly indicates that a PPP control protocol could not be negotiated. It suggests the connection stack could not complete required protocol configuration to establish the session.',
    },
    {
      slug: 'error-769',
      code: 'Error 769',
      shortLabel: 'Destination not reachable',
      summary: 'The specified destination was not reachable during a connection attempt.',
      whatMeans:
        'Error 769 commonly indicates the specified destination is not reachable. It often points to a missing or disabled network interface, incorrect connection settings, or an unavailable WAN path.',
    },
    {
      slug: 'error-772',
      code: 'Error 772',
      shortLabel: 'Dial-up failed',
      summary: 'A connection attempt could not complete due to a device or link failure.',
      whatMeans:
        'Error 772 is a common connection message indicating a dial-up or connection attempt failed due to a device/link issue. In modern contexts it is often encountered in legacy PPP flows and indicates the session could not be established.',
    },
    {
      slug: 'error-815',
      code: 'Error 815',
      shortLabel: 'Broadband connection failed',
      summary: 'A broadband connection attempt failed to establish a working session.',
      whatMeans:
        'Error 815 is a broadband connection failure message indicating the connection attempt did not complete successfully. It can point to ISP reachability, authentication, or modem/router configuration issues.',
    },
    {
      slug: 'error-868',
      code: 'Error 868',
      shortLabel: 'Remote connection not made',
      summary: 'A connection attempt could not reach the remote access server.',
      whatMeans:
        'Error 868 commonly indicates that a remote connection could not be made because the remote access server did not respond. It points to ISP/server reachability or name resolution issues rather than local Wi‑Fi pairing.',
    },
    {
      slug: 'error-619',
      code: 'Error 619',
      shortLabel: 'Port disconnected',
      summary: 'A connection attempt ended because the port was disconnected or the session was terminated.',
      whatMeans:
        'Error 619 commonly indicates a connection ended because the port was disconnected. It can occur when the session is terminated during negotiation due to network interruption, credentials, or device state changes.',
    },
    {
      slug: 'error-629',
      code: 'Error 629',
      shortLabel: 'Connection closed',
      summary: 'The remote endpoint closed the connection during session establishment.',
      whatMeans:
        'Error 629 is a common message indicating the connection was closed by the remote computer. It points to session termination during setup, often due to server-side refusal, credentials, or link instability.',
    },
  ],
  'pos-terminals': [
    {
      slug: 'declined',
      code: 'DECLINED',
      shortLabel: 'Issuer declined',
      summary: 'The terminal indicates the payment was not approved by the issuer.',
      whatMeans:
        '“DECLINED” on a POS terminal indicates the payment was not approved. The terminal typically does not expose the issuer’s internal reason to the merchant, so the authoritative details are in the processor record and the cardholder’s issuer communication.',
    },
    {
      slug: 'call-issuer',
      code: 'CALL ISSUER',
      shortLabel: 'Issuer contact required',
      summary: 'The terminal indicates the issuer requires the cardholder to contact them before approval.',
      whatMeans:
        '“CALL ISSUER” is a common terminal prompt indicating the issuer requires intervention before authorizing the transaction. It is not a technical terminal fault; it reflects an issuer decision that usually cannot be resolved by retrying immediately.',
    },
    {
      slug: 'communication-error',
      code: 'COMMUNICATION ERROR',
      shortLabel: 'Host communication failed',
      summary: 'The terminal could not communicate with the processing host to complete the request.',
      whatMeans:
        'A “COMMUNICATION ERROR” prompt indicates the terminal could not successfully reach the processing host. It can be caused by connectivity issues, DNS problems, firewall restrictions, or temporary upstream outages.',
    },
    {
      slug: 'host-unavailable',
      code: 'HOST UNAVAILABLE',
      shortLabel: 'Host unreachable',
      summary: 'The processing host was not reachable during the transaction attempt.',
      whatMeans:
        '“HOST UNAVAILABLE” indicates the terminal could not reach the processing host at that moment. It typically points to upstream reachability or service availability, not an issue with the card itself.',
    },
    {
      slug: 'timeout',
      code: 'TIMEOUT',
      shortLabel: 'Request timed out',
      summary: 'The terminal did not receive a response within the allowed time window.',
      whatMeans:
        'A “TIMEOUT” prompt indicates the terminal did not receive a response in time. Because timeouts can occur after a request is submitted, the safest next step is to confirm the final transaction state in the processor record before retrying.',
    },
    {
      slug: 'batch-not-closed',
      code: 'BATCH NOT CLOSED',
      shortLabel: 'Settlement pending',
      summary: 'The terminal indicates settlement/batch close was not completed successfully.',
      whatMeans:
        '“BATCH NOT CLOSED” is a common settlement prompt indicating end-of-day or batch close did not complete. It often requires confirming connectivity and host availability, then retrying the batch close under stable conditions.',
    },
    {
      slug: 'invalid-tid',
      code: 'INVALID TID',
      shortLabel: 'Terminal ID invalid',
      summary: 'The terminal configuration did not validate the terminal identifier for processing.',
      whatMeans:
        '“INVALID TID” indicates the terminal identifier configuration was not accepted for processing. It typically points to provisioning/configuration issues that require processor or acquirer support to correct.',
    },
    {
      slug: 'keys-not-loaded',
      code: 'KEYS NOT LOADED',
      shortLabel: 'Encryption keys missing',
      summary: 'The terminal is not ready to process because required keys are missing or not current.',
      whatMeans:
        '“KEYS NOT LOADED” indicates the terminal does not have required encryption keys or configuration to process transactions securely. This is a provisioning state and typically requires completing a key load or update process via official support channels.',
    },
    {
      slug: 'update-required',
      code: 'UPDATE REQUIRED',
      shortLabel: 'Update needed',
      summary: 'The terminal indicates a required software or configuration update must be applied first.',
      whatMeans:
        '“UPDATE REQUIRED” indicates the terminal must complete a software or configuration update before continuing normal operation. Updates often require stable connectivity and should be performed following the vendor’s recommended procedure.',
    },
    {
      slug: 'paper-out',
      code: 'PAPER OUT',
      shortLabel: 'Receipt paper empty',
      summary: 'The terminal or attached printer cannot print receipts because paper is missing.',
      whatMeans:
        '“PAPER OUT” indicates the receipt paper supply is empty or not detected. The transaction flow may continue depending on configuration, but receipt printing and some workflows can be blocked until paper is restored.',
    },
  ],
  'smart-devices': [
    {
      slug: '003',
      code: '003',
      shortLabel: 'Network connection error',
      summary: 'A smart streaming device could not connect to required network services.',
      whatMeans:
        'Error 003 is widely recognized on certain smart streaming devices as a network connection failure. It indicates the device cannot reach required online services to complete setup or updates, often due to connectivity or DNS issues.',
    },
    {
      slug: '005',
      code: '005',
      shortLabel: 'Network error',
      summary: 'The device could not complete an online step due to network connectivity problems.',
      whatMeans:
        'Error 005 is commonly referenced as a network-related failure during device operation or updates. It typically indicates the device cannot reach the required service endpoints under the current network conditions.',
    },
    {
      slug: '009',
      code: '009',
      shortLabel: 'Connection issue',
      summary: 'The device reported an issue connecting to online services.',
      whatMeans:
        'Error 009 is commonly referenced as a connectivity issue where the device cannot reach required services. It often requires verifying local network connectivity, DNS resolution, and whether the vendor service is degraded.',
    },
    {
      slug: '014',
      code: '014',
      shortLabel: 'Cannot connect to wireless network',
      summary: 'The device could not connect to the configured Wi‑Fi network.',
      whatMeans:
        'Error 014 is commonly referenced when a device cannot connect to a wireless network. It indicates the join step failed, which can involve Wi‑Fi credentials, band compatibility, or router security settings.',
    },
    {
      slug: '014-30',
      code: '014.30',
      shortLabel: 'Wireless signal or authentication issue',
      summary: 'The device could not complete a Wi‑Fi connection attempt under current conditions.',
      whatMeans:
        'Error 014.30 is commonly referenced as a Wi‑Fi connection failure during setup. It indicates the device could not complete the connection step, often due to weak signal, authentication failure, or router compatibility issues.',
    },
    {
      slug: '014-40',
      code: '014.40',
      shortLabel: 'Wireless configuration problem',
      summary: 'A Wi‑Fi configuration or compatibility issue prevented connecting to the network.',
      whatMeans:
        'Error 014.40 is commonly referenced as a Wi‑Fi configuration or compatibility problem. It indicates the device could not connect using the current network settings, which may involve band, encryption, or DHCP behavior.',
    },
    {
      slug: '016',
      code: '016',
      shortLabel: 'Service connection error',
      summary: 'The device could not reach required services, often during updates.',
      whatMeans:
        'Error 016 is commonly referenced when a device cannot reach required services to complete an operation such as an update. It points to connectivity, DNS, or service availability issues rather than local hardware faults.',
    },
    {
      slug: '018',
      code: '018',
      shortLabel: 'Service unavailable',
      summary: 'The device could not complete an online step due to service reachability problems.',
      whatMeans:
        'Error 018 is commonly referenced as a service reachability issue. It indicates the device could not complete an online step, which can be caused by network restrictions, DNS, or a vendor-side outage.',
    },
    {
      slug: '020',
      code: '020',
      shortLabel: 'Connection timeout',
      summary: 'The device timed out while trying to reach required services.',
      whatMeans:
        'Error 020 is commonly referenced when a device times out while connecting to online services. It suggests unstable connectivity or upstream service issues preventing a timely response.',
    },
    {
      slug: '023',
      code: '023',
      shortLabel: 'Cannot connect to server',
      summary: 'The device could not establish a connection to a required server endpoint.',
      whatMeans:
        'Error 023 is commonly referenced as a failure to connect to required servers. It can indicate local network restrictions, DNS issues, or an upstream service outage depending on timing and environment.',
    },
  ],
  'bios-uefi': [
    {
      slug: 'cmos-checksum-bad',
      code: 'CMOS CHECKSUM BAD',
      shortLabel: 'Firmware settings invalid',
      summary: 'Firmware reported that stored configuration data failed validation.',
      whatMeans:
        '“CMOS CHECKSUM BAD” indicates the firmware detected that stored configuration data did not validate correctly. It often appears after resets, configuration loss, or invalid settings, and may prompt loading defaults.',
    },
    {
      slug: 'cmos-battery-failure',
      code: 'CMOS BATTERY FAILURE',
      shortLabel: 'RTC/CMOS battery issue',
      summary: 'Firmware reported that the battery maintaining time/settings is not functioning correctly.',
      whatMeans:
        '“CMOS BATTERY FAILURE” indicates the firmware detected an issue with the battery used to maintain time and configuration settings. It can lead to time resets and configuration loss, affecting boot and security validation.',
    },
    {
      slug: 'no-bootable-device',
      code: 'NO BOOTABLE DEVICE',
      shortLabel: 'Boot device missing',
      summary: 'Firmware could not find a valid bootable device for the configured boot order.',
      whatMeans:
        '“NO BOOTABLE DEVICE” indicates the firmware could not find a bootable device based on current boot configuration. It can occur if the boot drive is not detected, the boot order is incorrect, or the OS bootloader is not accessible.',
    },
    {
      slug: 'smart-status-bad',
      code: 'SMART STATUS BAD',
      shortLabel: 'Drive health warning',
      summary: 'Firmware reported a storage device health warning condition.',
      whatMeans:
        '“SMART STATUS BAD” indicates the firmware received a health warning from the storage device’s SMART reporting. It suggests the drive may be failing and requires immediate attention, typically starting with data backup and vendor diagnostics.',
    },
    {
      slug: 'pxe-e61-media-test-failure',
      code: 'PXE-E61: MEDIA TEST FAILURE',
      shortLabel: 'Network boot attempted',
      summary: 'The system attempted network boot because a local boot device was not found.',
      whatMeans:
        '“PXE-E61: Media test failure” indicates the system attempted PXE/network boot and could not complete it. It often appears when the firmware falls back to network boot after failing to find a valid local boot device.',
    },
    {
      slug: 'secure-boot-violation',
      code: 'SECURE BOOT VIOLATION',
      shortLabel: 'Boot blocked by policy',
      summary: 'Firmware blocked boot because Secure Boot validation failed.',
      whatMeans:
        '“SECURE BOOT VIOLATION” indicates Secure Boot validation failed and firmware blocked the boot process. It can occur after changes to bootloaders, keys, or boot configuration that the firmware does not trust.',
    },
    {
      slug: 'tpm-device-not-detected',
      code: 'TPM DEVICE NOT DETECTED',
      shortLabel: 'TPM unavailable',
      summary: 'Firmware could not detect or initialize the TPM required for security features.',
      whatMeans:
        '“TPM DEVICE NOT DETECTED” indicates the firmware could not detect or initialize a TPM. It can block certain security features and boot policies depending on configuration and required compliance settings.',
    },
    {
      slug: 'boot-device-not-found',
      code: 'BOOT DEVICE NOT FOUND',
      shortLabel: 'Boot device unavailable',
      summary: 'Firmware could not locate the configured boot device or boot partition.',
      whatMeans:
        '“BOOT DEVICE NOT FOUND” indicates the firmware could not locate a device or partition needed to boot. It can be caused by boot order issues, storage detection problems, or missing bootloader configuration.',
    },
    {
      slug: 'keyboard-error',
      code: 'KEYBOARD ERROR OR NO KEYBOARD PRESENT',
      shortLabel: 'Input device not detected',
      summary: 'Firmware reported that a required keyboard input device was not detected during POST.',
      whatMeans:
        '“Keyboard error or no keyboard present” indicates the firmware did not detect a keyboard input device during POST. Some systems treat this as a warning; others block certain actions until input is available.',
    },
    {
      slug: 'cpu-fan-error',
      code: 'CPU FAN ERROR',
      shortLabel: 'Cooling issue detected',
      summary: 'Firmware detected a problem with CPU cooling fan operation.',
      whatMeans:
        '“CPU FAN ERROR” indicates the firmware detected that the CPU fan is not operating within expected parameters. Systems may reduce performance or halt boot to prevent overheating, and vendor guidance should be followed for safe remediation.',
    },
  ],
  'embedded-systems': [
    {
      slug: 'guru-meditation-error',
      code: 'GURU MEDITATION ERROR',
      shortLabel: 'Runtime panic',
      summary: 'An embedded runtime hit a fatal exception and reported a panic-style diagnostic.',
      whatMeans:
        '“Guru Meditation Error” is a widely recognized panic-style diagnostic in certain embedded runtimes. It indicates the system hit a fatal exception and halted or rebooted, and the accompanying log context is required to identify the exact fault.',
    },
    {
      slug: 'hardfault',
      code: 'HARDFAULT',
      shortLabel: 'CPU fault exception',
      summary: 'A Cortex-M style fault handler was triggered due to an invalid memory or instruction condition.',
      whatMeans:
        '“HardFault” is a common embedded fault class on Cortex‑M systems. It indicates the CPU trapped on an unrecoverable exception, often due to invalid memory access, stack corruption, or an illegal instruction.',
    },
    {
      slug: 'watchdog-reset',
      code: 'WATCHDOG RESET',
      shortLabel: 'Watchdog triggered',
      summary: 'The system rebooted because the watchdog timer was not serviced in time.',
      whatMeans:
        'A “watchdog reset” indicates the watchdog timer expired, forcing a reboot because the system did not complete a required heartbeat/loop in time. It can be caused by deadlocks, long blocking operations, or timing regressions.',
    },
    {
      slug: 'brownout-reset',
      code: 'BROWNOUT RESET',
      shortLabel: 'Undervoltage event',
      summary: 'The system reset because supply voltage dropped below a safe threshold.',
      whatMeans:
        'A “brownout reset” indicates the device reset due to an undervoltage condition. It suggests power instability, load spikes, or supply issues that must be addressed to prevent repeated resets.',
    },
    {
      slug: 'stack-overflow',
      code: 'STACK OVERFLOW',
      shortLabel: 'Stack exhaustion',
      summary: 'A task or thread exceeded its stack allocation and entered a fault state.',
      whatMeans:
        'A “stack overflow” indicates a task/thread exceeded its stack allocation. It often results from deep recursion, large local allocations, or unexpected call paths that increase stack usage beyond limits.',
    },
    {
      slug: 'illegal-instruction',
      code: 'ILLEGAL INSTRUCTION',
      shortLabel: 'Invalid CPU instruction',
      summary: 'The CPU attempted to execute an invalid instruction and trapped into a fault state.',
      whatMeans:
        'An “illegal instruction” fault indicates the CPU attempted to execute an instruction that is not valid in the current execution mode or for the target architecture. It can be caused by corrupted code memory or incorrect binary builds.',
    },
    {
      slug: 'assertion-failed',
      code: 'ASSERTION FAILED',
      shortLabel: 'Runtime assertion',
      summary: 'A runtime safety check triggered and halted or reset the system.',
      whatMeans:
        '“Assertion failed” indicates a runtime check detected an invalid state and triggered a controlled halt or reset. In embedded systems this often protects against unsafe operation and points to a logic or state machine issue.',
    },
    {
      slug: 'out-of-memory',
      code: 'OUT OF MEMORY',
      shortLabel: 'Allocation failure',
      summary: 'A required memory allocation failed due to exhausted heap or fragmentation.',
      whatMeans:
        'An “out of memory” condition indicates a required allocation failed because the system could not provide sufficient memory. It can be caused by leaks, fragmentation, or unexpected workload spikes.',
    },
    {
      slug: 'i2c-bus-error',
      code: 'I2C BUS ERROR',
      shortLabel: 'Bus communication failure',
      summary: 'A peripheral bus operation failed due to signaling or device state issues.',
      whatMeans:
        'An “I2C bus error” indicates a failure during communication on the I2C bus. It may reflect wiring/connectivity problems, peripheral address conflicts, or a device holding the bus in an unexpected state.',
    },
    {
      slug: 'flash-write-failed',
      code: 'FLASH WRITE FAILED',
      shortLabel: 'Storage operation failed',
      summary: 'A firmware or configuration write to flash storage did not complete successfully.',
      whatMeans:
        '“Flash write failed” indicates the device could not complete a write to non-volatile storage. It can be caused by wear limits, power interruption, or a protected partition/state that blocks the operation.',
    },
  ],
};

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function mdxForEntry(subKey, entry) {
  const cfg = SUBS[subKey];
  const related = CODES[subKey]
    .filter((c) => c.slug !== entry.slug)
    .slice(0, 4)
    .map((c) => `${c.code} — ${c.shortLabel}`);

  const lines = [];
  lines.push('---');
  lines.push(`industry: "systems"`);
  lines.push(`subcategory: "${subKey}"`);
  lines.push(`code: "${escapeHtml(entry.code)}"`);
  lines.push(`shortLabel: "${escapeHtml(entry.shortLabel)}"`);
  lines.push(`summary: "${escapeHtml(entry.summary)}"`);
  lines.push(`lastmod: "${now}"`);
  lines.push(`source: "manual"`);
  lines.push('---');
  lines.push('');
  lines.push('<div>');
  lines.push(`<p>SECTION: Systems &amp; Devices</p>`);
  lines.push(`<p>SYSTEM: ${escapeHtml(cfg.systemLabel)}</p>`);
  lines.push(`<p>CODE: ${escapeHtml(entry.code)}</p>`);
  lines.push('<p>Title</p>');
  lines.push(`<p>(${escapeHtml(entry.code)} &mdash; ${escapeHtml(entry.shortLabel)})</p>`);
  lines.push('<p>One-sentence summary</p>');
  lines.push(`<p>${escapeHtml(entry.summary)}</p>`);
  lines.push('<p>What this code means</p>');
  lines.push(`<p>${escapeHtml(entry.whatMeans)}</p>`);
  lines.push('<p>Where users usually see this code</p>');
  for (const it of cfg.whereSeen) lines.push(`<p>${escapeHtml(it)}</p>`);
  lines.push('<p>Why this code usually appears</p>');
  for (const it of cfg.whyAppears) lines.push(`<p>${escapeHtml(it)}</p>`);
  lines.push('<p>What typically happens next</p>');
  for (const it of cfg.happensNext) lines.push(`<p>${escapeHtml(it)}</p>`);
  lines.push('<p>What this code is NOT</p>');
  for (const it of cfg.notThis) lines.push(`<p>${escapeHtml(it)}</p>`);
  lines.push('<p>Troubleshooting checklist</p>');
  for (const it of cfg.troubleshooting) lines.push(`<p>${escapeHtml(it)}</p>`);
  lines.push('<p>Related error codes</p>');
  for (const it of related) lines.push(`<p>${escapeHtml(it)}</p>`);
  lines.push('<p>Notes and edge cases</p>');
  for (const it of cfg.notes) lines.push(`<p>${escapeHtml(it)}</p>`);
  lines.push('</div>');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  for (const subKey of Object.keys(CODES)) {
    const arr = CODES[subKey];
    const dir = path.join(outRoot, subKey);
    await fs.mkdir(dir, { recursive: true });
    for (const e of arr) {
      const filePath = path.join(dir, `${e.slug}.mdx`);
      const body = mdxForEntry(subKey, e);
      await fs.writeFile(filePath, body, 'utf8');
    }
  }
}

await main();

