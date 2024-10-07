import { Context as ContextTelegraf, Scenes } from 'telegraf';
import { SceneSessionData } from 'telegraf/typings/scenes';

export enum ScenesList {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ANIMAL_FORM = 'ANIMAL_FORM',
}

interface SessionContext extends ContextTelegraf {
  session: {};
}

interface SessionState extends SceneSessionData {}

export type SessionSceneContext = SessionContext & Scenes.SceneContext<SessionState>;
