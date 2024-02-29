import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { sign } from "hono/jwt";
import { withAccelerate } from '@prisma/extension-accelerate'
import { signinInput, signupInput} from "@doone/thoughts-app"
export const userrouter = new Hono<{
    Bindings: {
      DATABASE_URL : string
      JWT_SECRET: string
    }
  }>()

userrouter.post('/signup', async (c) => {
    
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json() ;
    const { success } = signupInput.safeParse(body);
    if (!success) {
      c.status(400);
      return c.json({ error: "invalid input" });
    }
    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
        },
      })
  
      const token = await sign({ id: user.id } , c.env.JWT_SECRET)
      return c.json({ message: 'User created successfully' , token : token})
    } catch (error) {
      c.status(403);
      return c.json({ error: "error while signing up" });
    }
    
})


userrouter.post('/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
  const { success } = signinInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
	const user = await prisma.user.findUnique({
		where: {
			email: body.email
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})