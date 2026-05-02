import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { TripStatus } from '@repo/shared/constants';
import { baseBusQuerySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { BusRoutes } from './routes';

const busHandler = new Hono<HonoEnv>()
  .get('/', ...BusRoutes.getBuses, validator('query', baseBusQuerySchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder } = query;

    const where: Prisma.BusWhereInput = {
      ...(query.agencyId && { agencyId: query.agencyId }),
      ...(query.minPlaces && { maxPlaces: { gte: query.minPlaces } }),
      ...(query.maxPlaces && { maxPlaces: { lte: query.maxPlaces } }),
    };

    const [data, total] = await Promise.all([
      prisma.bus.findMany({
        include: {
          _count: {
            select: {
              seats: true,
              trips: true,
            },
          },
          agency: {
            select: {
              id: true,
              name: true,
            },
          },
          seats: {
            select: {
              id: true,
              type: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        where,
      }),
      prisma.bus.count({ where }),
    ]);

    return ctx.json(
      {
        data,
        pagination: getPaginationMeta({
          limit: query.limit,
          page: query.page,
          total,
        }),
      },
      200
    );
  })
  .get('/:id', ...BusRoutes.getBus, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();
    const bus = await prisma.bus.findUnique({
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        seats: {
          orderBy: { createdAt: 'asc' },
        },
        trips: {
          orderBy: { createdAt: 'desc' },
          select: {
            createdAt: true,
            id: true,
            name: true,
            status: true,
          },
          take: 10,
        },
      },
      where: { licensePlate: id },
    });

    if (!bus) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'bus',
        message: t('bus.api.error.not_found'),
      });
    }

    return ctx.json(
      {
        data: bus,
      },
      200
    );
  })

  // .post(
  //   "/",
  //   ...BusRoutes.getBuses,
  //   Validator("json", createBusSchema),
  //   Async (ctx) => {
  //     Try {
  //       Const busData = ctx.req.valid("json");

  //       Const agencyExists = await prisma.agency.findUnique({
  //         Where: { id: busData.agencyId },
  //       });

  //       If (!agencyExists) {
  //         Throw new AppError({
  //           Code: "database:not_found",
  //           EntityType: "bus",
  //           Message: "bus.api.error.agency_not_found",
  //         });
  //       }

  //       Const result = await prisma.$transaction(async (tx) => {
  //         Const bus = await tx.bus.create({
  //           Data: {
  //             Title: busData.title,
  //             MaxPlaces: busData.maxPlaces,
  //             AgencyId: busData.agencyId,
  //             LicensePlate: busData.licensePlate,
  //           },
  //         });

  //         Const busSeatsData: Prisma.SeatCreateManyInput[] = [];

  //         BusSeatsData.push({
  //           BusId: bus.id,
  //           Type: BusSeatType.RIDER,
  //           Status: BusSeatStatus.AVAILABLE,
  //           Number: 0,
  //         });

  //         // fill database with initially empty bus seats
  //         For (let i = 1; i < busData.maxPlaces; i++) {
  //           BusSeatsData.push({
  //             BusId: bus.id,
  //             Type: BusSeatType.PASSENGER,
  //             Status: BusSeatStatus.AVAILABLE,
  //             Number: i,
  //           });
  //         }

  //         Await tx.seat.createMany({
  //           Data: busSeatsData,
  //         });

  //         Return await tx.bus.findUnique({
  //           Where: { id: bus.id },
  //           Include: {
  //             Agency: {
  //               Select: {
  //                 Id: true,
  //                 Name: true,
  //               },
  //             },
  //             Seats: true,
  //           },
  //         });
  //       });

  //       Return ctx.json(
  //         {
  //           Message: "bus.api.success.created",
  //           Data: result,
  //         },
  //         201,
  //       );
  //     } catch (error) {
  //       Console.log("error => ", error);
  //     }
  //   },
  // )

  // .put(
  //   "/:id",
  //   ...BusRoutes.updateBus,
  //   Validator("json", updateBusSchema),
  //   Async (ctx) => {
  //     Const { id } = ctx.req.param();
  //     Const updateData = ctx.req.valid("json");

  //     Const existingBus = await prisma.bus.findUnique({
  //       Where: { id },
  //       Include: {
  //         Trips: {
  //           Where: {
  //             Status: TripStatus.PENDING,
  //           },
  //           Select: { id: true },
  //         },
  //       },
  //     });

  //     If (!existingBus) {
  //       Throw new AppError({
  //         Code: "database:not_found",
  //         EntityType: "bus",
  //         Message: "bus.api.error.not_found",
  //       });
  //     }

  //     If (
  //       UpdateData.maxPlaces !== undefined &&
  //       UpdateData.maxPlaces !== existingBus.maxPlaces
  //     ) {
  //       If (existingBus.trips.length > 0) {
  //         Throw new AppError({
  //           Code: "database:query_error",
  //           EntityType: "bus",
  //           Message: "bus.api.error.update_seat_active_trips", //Cannot update seat capacity while bus has active trips
  //         });
  //       }
  //     }

  //     // Check if agency exists if updating agency
  //     If (updateData.idAgence && updateData.idAgence !== existingBus.agencyId) {
  //       Const agencyExists = await prisma.agency.findUnique({
  //         Where: { id: updateData.idAgence },
  //       });

  //       If (!agencyExists) {
  //         Throw new AppError({
  //           Code: "database:not_found",
  //           EntityType: "bus",
  //           Message: "bus.api.error.agency_not_found",
  //         });
  //       }
  //     }

  //     Const updatedBus = await prisma.bus.update({
  //       Where: { id },
  //       Data: updateData,
  //       Include: {
  //         Agency: {
  //           Select: {
  //             Id: true,
  //             Name: true,
  //           },
  //         },
  //         Seats: true,
  //       },
  //     });

  //     Return ctx.json(
  //       {
  //         Message: "bus.api.success.created",
  //         Data: updatedBus,
  //       },
  //       200,
  //     );
  //   },
  // )

  .delete('/:id', ...BusRoutes.deleteBus, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();
    const existingBus = await prisma.bus.findUnique({
      include: {
        trips: {
          select: {
            id: true,
            name: true,
          },
          where: {
            status: TripStatus.PENDING,
          },
        },
      },
      where: { licensePlate: id },
    });

    if (!existingBus) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'bus',
        message: t('bus.api.error.not_found'),
      });
    }

    if (existingBus.trips.length > 0) {
      throw new AppError({
        code: 'database:query_error',
        entityType: 'bus',
        message: t('bus.api.error.assigned_to_active_trips'),
      });
    }

    await prisma.bus.delete({
      where: { licensePlate: id },
    });

    return ctx.json(
      {
        message: t('bus.api.success.deleted'),
      },
      200
    );
  });

export default busHandler;
