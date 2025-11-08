import { buildApp } from './server.js'

const server = buildApp({
    logger: true
})

const port = Number(process.env.PORT) || 3000;

const start = async (): Promise<void> => {
    try {
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server is running at PORT : ${port}`)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()