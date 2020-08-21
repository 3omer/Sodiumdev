const { User } = require("../app_server/models/user");
const mongoose = require("mongoose")
const { connectMongo, closeMongo, postForm } = require("./utils")
const chai = require("chai")
const expect = chai.expect
const mocha = require("mocha");
const supertest = require("supertest")
const app = require("../app")


describe("Authintication", async () => {

    async function registerUser(user) {
        return await postForm(app, "/register", user)
    }

    async function cleanSessions() {
        await mongoose.connection.collection("sessions").deleteMany({})
    }



    describe("Register User", async () => {
        before(async () => {
            // clean
            await User.db.dropDatabase().then(console.log("Started .. Cleaned.."))
        })

        afterEach(async () => {
            // drop users
            await User.deleteMany({})
            await cleanSessions()
        })

        it("GET /Register page successfuly", async () => {
            const res = await supertest(app)
                .get("/register")
            expect(res.statusCode).to.eq(200)
            expect(res.text).contain("form").contain("Login")

        })

        it("POST valid data", async () => {
            const form = {
                username: "user1",
                email: "user1@email.com",
                password: "12345678"
            }

            const res = await registerUser(form)
            expect(res.statusCode).to.eq(201)
            // user is saved
            const user = await User.findOne({ email: form.email })
            expect(user).to.exist
            expect(user._id).to.exist
            expect(user.username).to.eq(form.username)
            // password is hashed
            expect(user.password).not.eq(form.password)
            expect(user.password).lengthOf(60)
        })

        it("fails on short username", async () => {
            const res = await registerUser(
                {
                    username: "us",
                    password: "12345678",
                    email: "user1@email.com"
                }
            )

            expect(res.statusCode).to.eq(400)
            expect(res.text).contain("Invalid data.")
                .contain("alert-danger")
                .contain("<form")

        })

        it("fails on short password ", async () => {
            const res = await registerUser({
                username: "usertest",
                email: "user@test.com",
                password: "1234567"
            })

            expect(res.statusCode).to.eq(400)
            expect(res.text).contain("alert-danger")
                .contain("Invalid data.")

        })

        it("fails on duplicate email", async () => {
            const user = {
                username: "usertest",
                email: "user@test.com",
                password: "12345678"
            }

            await registerUser(user)
            user.username = "user2"
            const res = await registerUser(user)
            expect(res.statusCode).to.eq(400)
            expect(res.text).contain("alert-danger")
                .contain("This email address is already registerd.")
        })

    })


    describe("Login", async () => {

        async function loginUser(user) {
            return await postForm(app, "/login", user)
        }
        const validUser1 = {
            username: "user1",
            password: "12345678",
            email: "user1@test.com"
        }

        const validUser2 = {
            username: "user2",
            password: "87654321",
            email: "user2@test.com"
        }



        before(async () => {
            // register two users

            try {
                await User.deleteMany({})
                await cleanSessions()

                await new User(validUser1).save()
                await new User(validUser2).save()
            } catch (error) {
                console.log(error)
                process.exit(1)
            }
        })

        after(async () => {
            await User.deleteMany({})
            await cleanSessions()
        }
        )

        it("GET login page", async () => {
            const res = await supertest(app).get("/login")
            expect(res.statusCode).to.eq(200)
            expect(res.text).to.contain("form")
        })

        it("Users exists", async () => {
            const count = await User.find({}).countDocuments()
            expect(count).to.eq(2)
        })

        // Flash messages doesnt show 
        // for some reason even if redirects is enabled :(
        it("login a valid user succefully", async () => {
            let cookies
            const res = await loginUser({
                email: validUser1.email,
                password: validUser1.password
            })
            cookies = res.headers["set-cookie"]
            expect(res.statusCode).to.eq(200)
            expect(cookies[0]).is.string
        })

        it("fails to login a user with correct email wrong pwd", async () => {
            const res = await loginUser({
                email: validUser1.email,
                password: "thisiswrong"
            })
            expect(res.text).to.contain("/login")
        })

    })

    describe("/dashboard", async () => {
        it("forbid unauthorizd users", async () => {
            const res = await supertest(app).get("/dashboard")
            expect(res.statusCode).to.eq(403)
        })
    })
})