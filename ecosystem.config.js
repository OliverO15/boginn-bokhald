module.exports = {
    apps: [
        {
            name: "boginn-bokhald",
            script: "node",
            args: ".next/standalone/server.js",
            env: {
                PORT: "3003",
                NODE_ENV: "production",
                DATABASE_URL: "postgresql://archery:archery@localhost:5433/archery",
            },
            watch: false,
            autorestart: true,
        },
    ],
};
