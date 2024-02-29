import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { userrouter } from '../routes/user'
import { bookrouter } from '../routes/blog'
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@prisma/client/extension'


const app = new Hono<{
  Bindings: {
    DATABASE_URL : string
    JWT_SECRET: string
  }
}>()

// MIDDLEWARES	


// Here c is the context object that contains the request and response objects
app.use('/api/v1/book/*', async (c, next) => {

	const jwt = c.req.header("Authorization");
	if (!jwt) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	const token = jwt.split(' ')[1];
	console.log(token);
	const payload = await verify(token, c.env.JWT_SECRET);
	if (!payload) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	c.set( "jwtPayload" , payload.id);
	await next()
})

// Routes  
app.route('/api/v1/user', userrouter);
app.route('/api/v1/book', bookrouter)
app.get('/' , async (c)=>{
	return c.text("Welcome to Thoughts")
})



export default app
