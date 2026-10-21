# Antifraud Hosting Components React

Sector-neutral controlled React screens for organization controllers and host
operators. The package owns presentation only. Applications retain
authentication, authorization, tenant resolution, network selection, BFF
calls, persistence and signing.

The package is intentionally separate from clinical/personal portal screens
and from education/qualification professional screens. Legacy professional
portals may consume these controller screens during migration; a later release
can remove their controller routes without moving UI again.
