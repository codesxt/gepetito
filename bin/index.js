#!/usr/bin/env node

import Conf from 'conf'
import prompt from 'prompt'
import readlineSync from 'readline-sync'
const config = new Conf({projectName: 'gepetito'})
import { Configuration, OpenAIApi } from "openai"

let apiKey = config.get('apikey')
let openai

const system_messages = [
  {
    role: 'system',
    content: `Eres un asistente de línea de comandos llamado Gepetito.`
  }
]
const user_messages = []

if (!apiKey) {
  console.log('No has definido tu api key. Debes ingresarla para poder usar la aplicación.')
  await gepetito_config()
} else {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  openai = new OpenAIApi(configuration)
}
console.log('Te damos la bienvenida a Gepetito.')
console.log('Para volver a configurar escribe /config. Para salir escribe /exit.')

while (true) {
  try {
    const question = readlineSync.question('[ Usuario ] ')
    if (question == '/config') {
      await gepetito_config()
    } else if (question == '/exit') {
      process.exit(0)
    }

    // hablar con Chat GPT
    user_messages[0] = {
      'role': 'user',
      'content': question
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      n: 1,
      temperature: 0,
      // max_tokens: 4096,
      messages: [
        ...system_messages,
        ...user_messages
      ]
    })
    
    const response_message = response.data.choices[0].message
    console.log(`[ Gepetito ] ` + response_message.content)
  } catch (error) {
    console.error(error)
  }
} 

async function gepetito_config () {
  const schema = {
    properties: {
      key: {
        description: 'Ingresa tu API key de OpenAI',
        type: 'string',
        hidden: true,
        replace: '*',
        required: true
      }
    }
  }
  prompt.start()
  const { key } = await prompt.get(schema)
  apiKey = key
  config.set('apikey', key)
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  openai = new OpenAIApi(configuration)
}

