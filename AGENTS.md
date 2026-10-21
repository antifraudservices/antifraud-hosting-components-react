# Antifraud Hosting Components agent contract

This public package owns sector-neutral controlled React screens for organization
controllers and host operators. It contains no health, veterinary, education or
qualification semantics.

Use red-green-refactor TDD. Begin every test suite with a flow-contract comment.
Components render host-supplied state and emit intentions only: they never
authenticate, authorize, fetch, persist, select a tenant or derive authority.
React and React DOM remain peer dependencies. Keep every component accessible,
keyboard-operable and independently importable.
