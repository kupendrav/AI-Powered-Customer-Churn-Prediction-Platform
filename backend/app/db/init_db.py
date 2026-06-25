def init():
    raise SystemExit(
        "Local database initialization has been retired. "
        "Use `npx @insforge/cli db migrations up --all` for schema changes."
    )


if __name__ == "__main__":
    init()
