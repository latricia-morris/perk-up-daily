import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import entriesRouter from "./entries";
import libraryRouter from "./library";
import promptsRouter from "./prompts";
import bugsRouter from "./bugs";
import neurocycleRouter from "./neurocycle";
import neuralTrainingRouter from "./neural_training";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(entriesRouter);
router.use(libraryRouter);
router.use(promptsRouter);
router.use(bugsRouter);
router.use(neurocycleRouter);
router.use(neuralTrainingRouter);
router.use(usersRouter);

export default router;
