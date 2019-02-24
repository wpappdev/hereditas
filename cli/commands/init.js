'use strict'

const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const process = require('process')
const path = require('path')
const Config = require('../lib/Config')
const {GenerateToken} = require('../lib/Crypto')

class InitCommand extends Command {
    async run() {
        const {flags} = this.parse(InitCommand)

        // Check if the folder is empty
        const files = fs.readdirSync('.')
        if (files.length) {
            this.error(`Directory ${process.cwd()} isn't empty; aborting`)
            return this.exit(1)
        }

        // Get the relative paths to the folders
        const contentDir = path.relative('', flags.content)
        const distDir = path.relative('', flags.dist)

        // Create the directories
        fs.mkdirSync(contentDir)
        fs.mkdirSync(distDir)

        // Generate an appToken
        const appToken = await GenerateToken(21)

        // Create configuration
        const config = new Config('hereditas.json')
        config.create({
            distDir: distDir,
            contentDir: contentDir,
            auth0: {
                domain: flags.auth0Domain,
                managementClientId: flags.auth0ClientId,
                managementClientSecret: flags.auth0ClientSecret
            },
            urls: flags.url,
            waitTime: 86400,
            appToken
        })
        await config.save()

        this.log('Project initialized')
    }
}

// Command description
InitCommand.description = `Initializes a new Hereditas project
`

// Command-line options
InitCommand.flags = {
    content: flags.string({
        char: 'i',
        description: 'Path of the directory with content',
        default: 'content'
    }),
    dist: flags.string({
        char: 'o',
        description: 'Path of the dist directory (where output is saved)',
        default: 'dist'
    }),
    auth0Domain: flags.string({
        char: 'd',
        description: 'Auth0 domain/tenant (e.g. "myhereditas.auth0.com")',
        required: true
    }),
    auth0ClientId: flags.string({
        char: 'c',
        description: 'Auth0 client ID for the management app',
        required: true
    }),
    auth0ClientSecret: flags.string({
        char: 's',
        description: 'Auth0 client secret for the management app',
        required: true
    }),
    url: flags.string({
        char: 'u',
        description: 'URL where the app is deployed to, used for OAuth callbacks (multiple values supported)',
        required: true,
        multiple: true
    })
}

module.exports = InitCommand
