import type { Request, Response } from 'express';
import { Router } from 'express';
import {
  defaultRescueTimeDate,
  resolveDailyUserSummary,
  resolveDeviceSeconds,
  resolveProductivityPulse,
  resolveTopActivities,
} from '../resolvers/rescuetime.js';
import { getQueryParam, sendResolverError } from './helpers.js';

export const rescueTimePortRouter = Router();

async function getProductivityPulse(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const date = defaultRescueTimeDate(getQueryParam(req, 'date'));
    const pulse = await resolveProductivityPulse(date);
    res.json(pulse);
  } catch (err) {
    sendResolverError(res, err, 'failed to load productivity pulse');
  }
}

async function getDailyUserSummary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const date = defaultRescueTimeDate(getQueryParam(req, 'date'));
    const summary = await resolveDailyUserSummary(date);
    res.json(summary);
  } catch (err) {
    sendResolverError(res, err, 'failed to load daily user summary');
  }
}

async function getTopActivities(req: Request, res: Response): Promise<void> {
  try {
    const date = defaultRescueTimeDate(getQueryParam(req, 'date'));
    const activities = await resolveTopActivities(
      date,
      getQueryParam(req, 'limit'),
    );
    res.json(activities);
  } catch (err) {
    sendResolverError(res, err, 'failed to load top activities');
  }
}

async function getDeviceSeconds(req: Request, res: Response): Promise<void> {
  try {
    const date = defaultRescueTimeDate(getQueryParam(req, 'date'));
    const devices = await resolveDeviceSeconds(date);
    res.json(devices);
  } catch (err) {
    sendResolverError(res, err, 'failed to load device seconds');
  }
}

rescueTimePortRouter.get('/productivity-pulse', getProductivityPulse);
rescueTimePortRouter.get('/daily-user-summary', getDailyUserSummary);
rescueTimePortRouter.get('/top-activities', getTopActivities);
rescueTimePortRouter.get('/device-seconds', getDeviceSeconds);
