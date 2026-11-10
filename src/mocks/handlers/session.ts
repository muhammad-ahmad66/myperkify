import { ok } from '../http';
import { currentUser, toViewer } from '../session';

export function getSession(request: Request): Response {
  return ok(toViewer(currentUser(request)));
}
