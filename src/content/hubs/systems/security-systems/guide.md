## Interpreting security errors safely

Security codes often require context:

- Was the action a **login**, **elevation**, **enrollment**, or **policy check**?
- Did it involve **MFA**, **certificates**, or **device compliance**?
- Is the failure happening on **one account** or across the environment?

Start with safe checks: confirm the correct credentials, verify time and time zone, check account status, and review any available audit logs. Avoid disabling security controls as a troubleshooting step.

