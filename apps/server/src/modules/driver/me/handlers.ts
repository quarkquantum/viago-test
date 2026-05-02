import { useTranslation } from '@intlify/hono';
import { prisma } from '@repo/database';
import { NotificationStatus, SystemRoles, TripStatus } from '@repo/shared';
import { updateUserFcmTokenSchema, updateUserSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { getDistanceInKm } from '@/utils/haversine';
import MeRoutes from './routes';

const userHandler = new Hono<HonoEnv>()
  .get('/', ...MeRoutes.getMe, async (ctx) => {
    const user = getContextUser();

    const data = await prisma.user.findUnique({
      select: {
        createdAt: true,
        email: true,
        emailVerified: true,
        fullName: true,
        profile: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        sessions: true,
        rating: true,
        reviewCount: true,
        agencyMemberships: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            createdAt: true,
            agency: {
              select: {
                description: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      where: {
        id: user.id,
      },
    });

    return ctx.json(data);
  })
  .patch('/', ...MeRoutes.edit, validator('json', updateUserSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const updateData = ctx.req.valid('json');

    await prisma.profile.update({
      data: updateData,
      where: { userId: user.id },
    });

    return ctx.json({
      message: t('me.api.success.updated'),
      success: true,
    });
  })
  .get('/dashboard', ...MeRoutes.dashboard, async (ctx) => {
    const user = getContextUser();
    const [unreadNotifications, upcomingTrips, currentTrip, nextTrip] = await Promise.all([
      prisma.notification.findMany({
        where: {
          recipientId: user.id,
          readAt: null,
          status: NotificationStatus.UNREAD,
        },
        take: 10, // to show "+9" if count > 9, no need to fetch all to show count
      }),
      prisma.trip.findMany({
        where: {
          status: TripStatus.PENDING,
          departureTime: {
            gte: new Date(),
          },
        },
        select: {
          _count: {
            select: {
              bookings: true,
              stations: true,
            },
          },
          agency: {
            select: {
              name: true,
            },
          },
          arrivalTime: true,
          bus: {
            select: {
              licensePlate: true,
              maxPlaces: true,
              seatReservationType: true,
              title: true,
            },
          },
          departureTime: true,
          driver: {
            select: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phoneNumber: true,
                    },
                  },
                },
              },
            },
          },
          createdAt: true,
          description: true,
          id: true,
          name: true,
          status: true,
          stations: {
            orderBy: {
              order: 'asc',
            },
            select: {
              city: {
                select: {
                  name: true,
                  latitude: true,
                  longitude: true,
                },
              },
              departureTime: true,
              id: true,
              name: true,
              order: true,
              startingPrice: true,
              status: true,
              bookingsFrom: {
                select: {
                  id: true,
                  passenger: {
                    select: {
                      fullName: true,
                      profile: {
                        select: {
                          phoneNumber: true,
                        },
                      },
                    },
                  },
                  seat: {
                    select: {
                      number: true,
                    },
                  },
                },
              },
              bookingsTo: {
                select: {
                  id: true,
                  passenger: {
                    select: {
                      fullName: true,
                      profile: {
                        select: {
                          phoneNumber: true,
                        },
                      },
                    },
                  },
                  seat: {
                    select: {
                      number: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          departureTime: 'asc',
        },
      }),
      prisma.trip.findFirst({
        where: {
          // driverId: user.id,
          status: TripStatus.ONGOING,
        },
        select: {
          _count: {
            select: {
              bookings: true,
              stations: true,
            },
          },
          agency: {
            select: {
              name: true,
            },
          },
          arrivalTime: true,
          bus: {
            select: {
              licensePlate: true,
              maxPlaces: true,
              seatReservationType: true,
              title: true,
            },
          },
          departureTime: true,
          driver: {
            select: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phoneNumber: true,
                    },
                  },
                },
              },
            },
          },
          createdAt: true,
          description: true,
          id: true,
          name: true,
          status: true,
          stations: {
            orderBy: {
              order: 'asc',
            },
            select: {
              city: {
                select: {
                  name: true,
                  latitude: true,
                  longitude: true,
                },
              },
              departureTime: true,
              id: true,
              name: true,
              order: true,
              startingPrice: true,
              status: true,
              bookingsFrom: {
                select: {
                  id: true,
                  passenger: {
                    select: {
                      fullName: true,
                      profile: {
                        select: {
                          phoneNumber: true,
                        },
                      },
                    },
                  },
                  seat: {
                    select: {
                      number: true,
                    },
                  },
                },
              },
              bookingsTo: {
                select: {
                  id: true,
                  passenger: {
                    select: {
                      fullName: true,
                      profile: {
                        select: {
                          phoneNumber: true,
                        },
                      },
                    },
                  },
                  seat: {
                    select: {
                      number: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.trip.findFirst({
        where: {
          status: TripStatus.PENDING,
        },
        select: {
          _count: {
            select: {
              bookings: true,
              stations: true,
            },
          },
          agency: {
            select: {
              name: true,
            },
          },
          arrivalTime: true,
          bus: {
            select: {
              licensePlate: true,
              maxPlaces: true,
              seatReservationType: true,
              title: true,
            },
          },
          departureTime: true,
          driver: {
            select: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phoneNumber: true,
                    },
                  },
                },
              },
            },
          },
          createdAt: true,
          description: true,
          id: true,
          name: true,
          status: true,
          stations: {
            orderBy: {
              order: 'asc',
            },
            select: {
              city: {
                select: {
                  name: true,
                  latitude: true,
                  longitude: true,
                },
              },
              departureTime: true,
              id: true,
              name: true,
              order: true,
              startingPrice: true,
              status: true,
              bookingsFrom: {
                select: {
                  id: true,
                  passenger: {
                    select: {
                      fullName: true,
                      profile: {
                        select: {
                          phoneNumber: true,
                        },
                      },
                    },
                  },
                  seat: {
                    select: {
                      number: true,
                    },
                  },
                },
              },
              bookingsTo: {
                select: {
                  id: true,
                  passenger: {
                    select: {
                      fullName: true,
                      profile: {
                        select: {
                          phoneNumber: true,
                        },
                      },
                    },
                  },
                  seat: {
                    select: {
                      number: true,
                    },
                  },
                },
              },
            },
          },
        },
        take: 1,
        orderBy: {
          departureTime: 'asc',
        },
      }),
    ]);

    return ctx.json({
      unreadNotifications,
      upcomingTrips,
      currentTrip,
      nextTrip,
    });
  })
  .get('/stats', ...MeRoutes.stats, async (ctx) => {
    const user = getContextUser();

    // Get all agency driver records for this user
    const agencyDrivers = await prisma.agencyMember.findMany({
      select: { id: true },
      where: {
        userId: user.id,
        role: { name: SystemRoles.DRIVER },
      },
    });

    const driverIds = agencyDrivers.map((ad) => ad.id);

    const [totalTrips, upcomingTrips, completedTrips] = await Promise.all([
      prisma.trip.count({
        where: { driverId: { in: driverIds } },
      }),
      prisma.trip.count({
        where: {
          driverId: { in: driverIds },
          status: TripStatus.PENDING,
        },
      }),
      prisma.trip.findMany({
        where: {
          driverId: { in: driverIds },
          status: TripStatus.COMPLETED,
        },
        select: {
          stations: {
            orderBy: { order: 'asc' },
            select: {
              city: {
                select: {
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalDistance = completedTrips.reduce((acc, trip) => {
      const firstCity = trip.stations[0]?.city;
      const lastCity = trip.stations.at(-1)?.city;

      if (firstCity && lastCity) {
        return acc + getDistanceInKm(firstCity, lastCity);
      }
      return acc;
    }, 0);

    return ctx.json({
      totalTrips,
      upcomingTrips,
      totalDistance: Math.round(totalDistance),
    });
  })
  .patch('/fcm-token', ...MeRoutes.updateFcmToken, validator('json', updateUserFcmTokenSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const { token } = ctx.req.valid('json');

    await prisma.user.update({
      data: { fcmToken: token },
      where: { id: user.id },
    });

    return ctx.json({ message: t('me.api.success.updated'), success: true }, 200);
  });

export default userHandler;
