import { type Task } from 'wasp/entities';

import {
  generateGptResponse,
  deleteTask,
  updateTask,
  createTask,
  useQuery,
  getAllTasksByUser,
} from 'wasp/client/operations';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { CgSpinner } from 'react-icons/cg';
import { TiDelete } from 'react-icons/ti';
import type { GeneratedSchedule, MainTask, SubTask } from './schedule';
import { cn } from '../client/cn';
import LanguageSelector from './LanguageSelector';
import { SUPPORTED_LANGUAGES } from './constants';
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // For swap button icon

export default function DemoAppPage() {
  const { data: user, isLoading: isUserLoading } = useAuth();

  // Default to first language in the list or specific codes
  const [yourLanguage, setYourLanguage] = useState<string>(SUPPORTED_LANGUAGES[0]?.code || 'en');
  const [theirLanguage, setTheirLanguage] = useState<string>(SUPPORTED_LANGUAGES[1]?.code || 'es');
  const [isInterpreterBusy, setIsInterpreterBusy] = useState<boolean>(false); // Example state

  const kycStatus = user?.kycStatus as string | undefined; // Assuming kycStatus is on the user object

  const handleStartInterpretation = () => {
    // Placeholder for starting the interpretation logic
    console.log(`Starting interpretation: Your lang: ${yourLanguage}, Their lang: ${theirLanguage}`);
    setIsInterpreterBusy(true);
    // Simulate some activity
    setTimeout(() => setIsInterpreterBusy(false), 3000);
  };

  const handleSwapLanguages = () => {
    const currentYourLang = yourLanguage;
    setYourLanguage(theirLanguage);
    setTheirLanguage(currentYourLang);
  };

  // Ensure 'theirLanguage' is not the same as 'yourLanguage'
  useEffect(() => {
    if (yourLanguage === theirLanguage) {
      // Find the first language that is not 'yourLanguage' and set it as 'theirLanguage'
      const newTheirLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code !== yourLanguage);
      if (newTheirLanguage) {
        setTheirLanguage(newTheirLanguage.code);
      } else if (SUPPORTED_LANGUAGES.length > 1) {
        // Fallback if somehow all languages are the same (should not happen with a diverse list)
        // Or if yourLanguage was the last in a list of 2 and they became same.
        setTheirLanguage(SUPPORTED_LANGUAGES.find(lang => lang.code !== yourLanguage) || SUPPORTED_LANGUAGES[0].code);
      }
    }
  }, [yourLanguage, theirLanguage]);


  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* AI Interpreter Section */}
        <div className='mx-auto max-w-4xl text-center mb-12'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            <span className='text-purple-500'>AI</span> Phone Call Interpreter
          </h2>
          <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
            Select your language and the language of the other person on the call.
          </p>
        </div>

        <div className='mx-auto max-w-2xl mb-10 p-6 border rounded-3xl border-gray-900/10 dark:border-gray-100/10 shadow-lg'>
          {isUserLoading ? (
            <div className="flex justify-center items-center h-32">
              <CgSpinner className="animate-spin h-8 w-8 text-purple-500" />
            </div>
          ) : kycStatus === 'verified' ? (
            <>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex-grow">
                  <LanguageSelector
                yourLanguage={yourLanguage}
                theirLanguage={theirLanguage}
                onYourLanguageChange={setYourLanguage}
                onTheirLanguageChange={setTheirLanguage}
                disabled={isInterpreterBusy}
              />
            </div>
            <button
              onClick={handleSwapLanguages}
              title="Swap languages"
              className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 disabled:opacity-50"
              disabled={isInterpreterBusy}
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
          <button
            onClick={handleStartInterpretation}
            disabled={isInterpreterBusy || !yourLanguage || !theirLanguage || yourLanguage === theirLanguage}
            className='mt-6 w-full flex items-center justify-center min-w-[7rem] font-medium text-white bg-purple-600 shadow-md ring-1 ring-inset ring-purple-700 py-2.5 px-4 rounded-md hover:bg-purple-700 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {isInterpreterBusy ? (
              <>
                <CgSpinner className='inline-block mr-2 animate-spin' />
                Processing...
              </>
            ) : (
              'Start Interpreted Call'
            )}
          </button>
          {yourLanguage === theirLanguage && SUPPORTED_LANGUAGES.length > 1 && (
            <p className="mt-2 text-sm text-red-600 text-center">
              Please select two different languages.
            </p>
          )}
            </>
          ) : (
            <div className="text-center py-6">
              {kycStatus === 'pending_review' ? (
                <p className="text-lg text-yellow-600 dark:text-yellow-400">
                  Your KYC information is currently under review. We'll notify you once it's processed.
                </p>
              ) : kycStatus === 'rejected' || kycStatus === 'resubmit_required' ? (
                <>
                  <p className="text-lg text-red-600 dark:text-red-400 mb-4">
                    There was an issue with your KYC verification. Please check your details and resubmit.
                  </p>
                  <WaspRouterLink
                    to={routes.KycRoute.to}
                    className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Resubmit KYC Information
                  </WaspRouterLink>
                </>
              ) : ( // Covers null, undefined, 'none', or any other status
                <>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                    To use the AI Phone Call Interpreter, please complete your identity verification (KYC).
                  </p>
                  <WaspRouterLink
                    to={routes.KycRoute.to}
                    className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Complete KYC Verification
                  </WaspRouterLink>
                </>
              )}
            </div>
          )}
        </div>

        {/* Existing AI Day Scheduler Section - can be kept or removed based on new app focus */}
        <div className='mx-auto max-w-4xl text-center mt-20'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            <span className='text-yellow-500'>AI</span> Day Scheduler
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
          This example app uses OpenAI's chat completions with function calling to return a structured JSON object. Try
          it out, enter your day's tasks, and let AI do the rest!
        </p>
        <div className='my-8 border rounded-3xl border-gray-900/10 dark:border-gray-100/10'>
          <div className='sm:w-[90%] md:w-[70%] lg:w-[50%] py-10 px-6 mx-auto my-8 space-y-10'>
            <NewTaskForm handleCreateTask={createTask} />
          </div>
        </div>
        {/* end AI-powered Todo List */}
      </div>
    </div>
  );
}

function NewTaskForm({ handleCreateTask }: { handleCreateTask: typeof createTask }) {
  const [description, setDescription] = useState<string>('');
  const [todaysHours, setTodaysHours] = useState<number>(8);
  const [response, setResponse] = useState<GeneratedSchedule | null>({
    mainTasks: [
      {
        name: 'Respond to emails',
        priority: 'high',
      },
      {
        name: 'Learn WASP',
        priority: 'low',
      },
      {
        name: 'Read a book',
        priority: 'medium',
      },
    ],
    subtasks: [
      {
        description: 'Read introduction and chapter 1',
        time: 0.5,
        mainTaskName: 'Read a book',
      },
      {
        description: 'Read chapter 2 and take notes',
        time: 0.3,
        mainTaskName: 'Read a book',
      },
      {
        description: 'Read chapter 3 and summarize key points',
        time: 0.2,
        mainTaskName: 'Read a book',
      },
      {
        description: 'Check and respond to important emails',
        time: 1,
        mainTaskName: 'Respond to emails',
      },
      {
        description: 'Organize and prioritize remaining emails',
        time: 0.5,
        mainTaskName: 'Respond to emails',
      },
      {
        description: 'Draft responses to urgent emails',
        time: 0.5,
        mainTaskName: 'Respond to emails',
      },
      {
        description: 'Watch tutorial video on WASP',
        time: 0.5,
        mainTaskName: 'Learn WASP',
      },
      {
        description: 'Complete online quiz on the basics of WASP',
        time: 1.5,
        mainTaskName: 'Learn WASP',
      },
      {
        description: 'Review quiz answers and clarify doubts',
        time: 1,
        mainTaskName: 'Learn WASP',
      },
    ],
  });
  const [isPlanGenerating, setIsPlanGenerating] = useState<boolean>(false);

  const { data: tasks, isLoading: isTasksLoading } = useQuery(getAllTasksByUser);

  const handleSubmit = async () => {
    try {
      await handleCreateTask({ description });
      setDescription('');
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'));
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setIsPlanGenerating(true);
      const response = await generateGptResponse({
        hours: todaysHours,
      });
      if (response) {
        setResponse(response);
      }
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'));
    } finally {
      setIsPlanGenerating(false);
    }
  };

  return (
    <div className='flex flex-col justify-center gap-10'>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <input
            type='text'
            id='description'
            className='text-sm text-gray-600 w-full rounded-md border border-gray-200 bg-[#f5f0ff] shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
            placeholder='Enter task description'
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
         <button
            type='button'
            onClick={handleSubmit}
            disabled={!description}
            className={cn(
              'min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md duration-200 ease-in-out focus:outline-none focus:shadow-none',
              description && 'hover:bg-yellow-100 hover:shadow-none'
            )}
          >
            Add Task
          </button>
        </div>
      </div>

      <div className='space-y-10 col-span-full'>
        {isTasksLoading && <div>Loading...</div>}
        {tasks!! && tasks.length > 0 ? (
          <div className='space-y-4'>
            {tasks.map((task: Task) => (
              <Todo key={task.id} id={task.id} isDone={task.isDone} description={task.description} time={task.time} />
            ))}
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between gap-3'>
                <label htmlFor='time' className='text-sm text-gray-600 dark:text-gray-300 text-nowrap font-semibold'>
                  How many hours will you work today?
                </label>
                <input
                  type='number'
                  id='time'
                  step={0.5}
                  min={1}
                  max={24}
                  className='min-w-[7rem] text-gray-800/90 text-center font-medium rounded-md border border-gray-200 bg-yellow-50 hover:bg-yellow-100 shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
                  value={todaysHours}
                  onChange={(e) => setTodaysHours(+e.currentTarget.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className='text-gray-600 text-center'>Add tasks to begin</div>
        )}
      </div>

      <button
        type='button'
        disabled={isPlanGenerating || tasks?.length === 0}
        onClick={() => handleGeneratePlan()}
        className='flex items-center justify-center min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none disabled:opacity-70 disabled:cursor-not-allowed'
      >
        {isPlanGenerating ? (
          <>
            <CgSpinner className='inline-block mr-2 animate-spin' />
            Generating...
          </>
        ) : (
          'Generate Schedule'
        )}
      </button>

      {!!response && (
        <div className='flex flex-col'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Today's Schedule</h3>

          <TaskTable schedule={response} />
        </div>
      )}
    </div>
  );
}

type TodoProps = Pick<Task, 'id' | 'isDone' | 'description' | 'time'>;

function Todo({ id, isDone, description, time }: TodoProps) {
  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateTask({
      id,
      isDone: e.currentTarget.checked,
    });
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateTask({
      id,
      time: e.currentTarget.value,
    });
  };

  const handleDeleteClick = async () => {
    await deleteTask({ id });
  };

  return (
    <div className='flex items-center justify-between bg-purple-50 rounded-lg border border-gray-200 p-2 w-full'>
      <div className='flex items-center justify-between gap-5 w-full'>
        <div className='flex items-center gap-3'>
          <input
            type='checkbox'
            className='ml-1 form-checkbox bg-purple-300 checked:bg-purple-300 rounded border-purple-400 duration-200 ease-in-out hover:bg-purple-400 hover:checked:bg-purple-600 focus:ring focus:ring-purple-300 focus:checked:bg-purple-400 focus:ring-opacity-50 text-black'
            checked={isDone}
            onChange={handleCheckboxChange}
          />
          <span
            className={cn('text-slate-600', {
              'line-through text-slate-500': isDone,
            })}
          >
            {description}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <input
            id='time'
            type='number'
            min={0.5}
            step={0.5}
            className={cn(
              'w-18 h-8 text-center text-slate-600 text-xs rounded border border-gray-200 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50',
              {
                'pointer-events-none opacity-50': isDone,
              }
            )}
            value={time}
            onChange={handleTimeChange}
          />
          <span
            className={cn('italic text-slate-600 text-xs', {
              'text-slate-500': isDone,
            })}
          >
            hrs
          </span>
        </div>
      </div>
      <div className='flex items-center justify-end w-15'>
        <button className='p-1' onClick={handleDeleteClick} title='Remove task'>
          <TiDelete size='20' className='text-red-600 hover:text-red-700' />
        </button>
      </div>
    </div>
  );
}

function TaskTable({ schedule }: { schedule: GeneratedSchedule }) {
  return (
    <div className='flex flex-col gap-6 py-6'>
      <table className='table-auto w-full border-separate border border-spacing-2 rounded-md border-slate-200 shadow-sm'>
        {!!schedule.mainTasks ? (
          schedule.mainTasks
            .map((mainTask) => <MainTaskTable key={mainTask.name} mainTask={mainTask} subtasks={schedule.subtasks} />)
            .sort((a, b) => {
              const priorityOrder = ['low', 'medium', 'high'];
              if (a.props.mainTask.priority && b.props.mainTask.priority) {
                return (
                  priorityOrder.indexOf(b.props.mainTask.priority) - priorityOrder.indexOf(a.props.mainTask.priority)
                );
              } else {
                return 0;
              }
            })
        ) : (
          <div className='text-slate-600 text-center'>OpenAI didn't return any Main Tasks. Try again.</div>
        )}
      </table>

      {/* ))} */}
    </div>
  );
}

function MainTaskTable({ mainTask, subtasks }: { mainTask: MainTask; subtasks: SubTask[] }) {
  return (
    <>
      <thead>
        <tr>
          <th
            className={cn(
              'flex items-center justify-between gap-5 py-4 px-3 text-slate-800 border rounded-md border-slate-200 bg-opacity-70',
              {
                'bg-red-100': mainTask.priority === 'high',
                'bg-green-100': mainTask.priority === 'low',
                'bg-yellow-100': mainTask.priority === 'medium',
              }
            )}
          >
            <span>{mainTask.name}</span>
            <span className='opacity-70 text-xs font-medium italic'> {mainTask.priority} priority</span>
          </th>
        </tr>
      </thead>
      {!!subtasks ? (
        subtasks.map((subtask) => {
          if (subtask.mainTaskName === mainTask.name) {
            return (
              <tbody key={subtask.description}>
                <tr>
                  <td
                    className={cn(
                      'flex items-center justify-between gap-4 py-2 px-3 text-slate-600 border rounded-md border-purple-100 bg-opacity-60',
                      {
                        'bg-red-50': mainTask.priority === 'high',
                        'bg-green-50': mainTask.priority === 'low',
                        'bg-yellow-50': mainTask.priority === 'medium',
                      }
                    )}
                  >
                    <SubtaskTable description={subtask.description} time={subtask.time} />
                  </td>
                </tr>
              </tbody>
            );
          }
        })
      ) : (
        <div className='text-slate-600 text-center'>OpenAI didn't return any Subtasks. Try again.</div>
      )}
    </>
  );
}

function SubtaskTable({ description, time }: { description: string; time: number }) {
  const [isDone, setIsDone] = useState<boolean>(false);

  const convertHrsToMinutes = (time: number) => {
    if (time === 0) return 0;
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours > 0 ? hours + 'hr' : ''} ${minutes > 0 ? minutes + 'min' : ''}`;
  };

  const minutes = useMemo(() => convertHrsToMinutes(time), [time]);

  return (
    <>
      <input
        type='checkbox'
        className='ml-1 form-checkbox bg-purple-500 checked:bg-purple-300 rounded border-purple-600 duration-200 ease-in-out hover:bg-purple-600 hover:checked:bg-purple-600 focus:ring focus:ring-purple-300 focus:checked:bg-purple-400 focus:ring-opacity-50'
        checked={isDone}
        onChange={(e) => setIsDone(e.currentTarget.checked)}
      />
      <span
        className={cn('leading-tight justify-self-start w-full text-slate-600', {
          'line-through text-slate-500 opacity-50': isDone,
        })}
      >
        {description}
      </span>
      <span
        className={cn('text-slate-600 text-right', {
          'line-through text-slate-500 opacity-50': isDone,
        })}
      >
        {minutes}
      </span>
    </>
  );
}
