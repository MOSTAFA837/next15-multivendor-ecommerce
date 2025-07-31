"use server";

import { db } from "@/lib/db";
import {
  ProductPageType,
  ProductShippingDetailsType,
  ProductWithVariantType,
  RatingStatisticsType,
  SortOrder,
  VariantImageType,
  VariantSimplified,
} from "@/lib/types";
import { currentUser } from "@/lib/use-current-user";
import { generateUniqueSlug } from "@/lib/utils";
import { Country, ProductVariant, Size, Store } from "@prisma/client";

import slugify from "slugify";

export const upsertProduct = async (
  product: ProductWithVariantType,
  storeUrl: string
) => {
  try {
    // Retrieve current user
    const user = await currentUser();

    // Check if user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Ensure user has seller privileges
    if (user.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    // Ensure product data is provided
    if (!product) throw new Error("Please provide product data.");

    // Find the store by URL
    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });
    if (!store) throw new Error("Store not found.");

    // Check if the product already exists
    const existingProduct = await db.product.findUnique({
      where: { id: product.productId },
    });

    // Check if the variant already exists
    const existingVariant = await db.productVariant.findUnique({
      where: { id: product.variantId },
    });

    if (existingProduct) {
      if (existingVariant) {
        // Create new variant
        await handleCreateVariant(product);
      } else {
        try {
          // Create new variant
          await handleCreateVariant(product);
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      // Create new product and variant
      await handleProductCreate(product, store.id);
    }
  } catch (error) {
    throw error;
  }
};

const handleProductCreate = async (
  product: ProductWithVariantType,
  storeId: string
) => {
  // Generate unique slugs for product and variant
  const productSlug = await generateUniqueSlug(
    slugify(product.name, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "product"
  );

  const variantSlug = await generateUniqueSlug(
    slugify(product.variantName, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "productVariant"
  );

  const productData = {
    id: product.productId,
    name: product.name,
    description: product.description,
    slug: productSlug,
    store: { connect: { id: storeId } },
    category: { connect: { id: product.categoryId } },
    subCategory: { connect: { id: product.subCategoryId } },
    offerTag: { connect: { id: product.offerTagId } },
    brand: product.brand,
    specs: {
      create: product.product_specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })),
    },
    questions: {
      create: product.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
      })),
    },
    variants: {
      create: [
        {
          id: product.variantId,
          variantName: product.variantName,
          variantDescription: product.variantDescription,
          slug: variantSlug,
          sku: product.sku,
          weight: product.weight,
          keywords: product.keywords.join(","),
          isSale: product.isSale,
          saleEndDate: product.saleEndDate,
          variantImage: product.variantImage,
          images: {
            create: product.images.map((img) => ({
              url: img.url,
            })),
          },
          colors: {
            create: product.colors.map((color) => ({
              name: color.color,
            })),
          },
          sizes: {
            create: product.sizes.map((size) => ({
              size: size.size,
              price: size.price,
              quantity: size.quantity,
              discount: size.discount,
            })),
          },
          specs: {
            create: product.variant_specs.map((spec) => ({
              name: spec.name,
              value: spec.value,
            })),
          },
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      ],
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  const new_product = await db.product.create({ data: productData });
  return new_product;
};

const handleCreateVariant = async (product: ProductWithVariantType) => {
  const variantSlug = await generateUniqueSlug(
    slugify(product.variantName, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "productVariant"
  );

  const variantData = {
    id: product.variantId,
    variantName: product.variantName,
    variantDescription: product.variantDescription,
    slug: variantSlug,
    isSale: product.isSale,
    saleEndDate: product.saleEndDate,
    keywords: product.keywords.join(","),
    sku: product.sku,
    weight: product.weight,
    productId: product.productId,
    variantImage: product.variantImage,
    images: {
      create: product.images.map((img) => ({
        url: img.url,
      })),
    },
    colors: {
      create: product.colors.map((color) => ({
        name: color.color,
      })),
    },
    sizes: {
      create: product.sizes.map((size) => ({
        size: size.size,
        price: size.price,
        quantity: size.quantity,
        discount: size.discount,
      })),
    },
    specs: {
      create: product.variant_specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })),
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  const new_variant = await db.productVariant.create({ data: variantData });
  return new_variant;
};

export const getProductMainInfo = async (productId: string) => {
  // Retrieve the product from the database
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      questions: true,
      specs: true,
    },
  });
  if (!product) return null;

  // Return the main information of the product
  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    storeId: product.storeId,
    questions: product.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
    })),
    product_specs: product.specs.map((spec) => ({
      name: spec.name,
      value: spec.value,
    })),
  };
};

export const getProductVariant = async (
  productId: string,
  variantId: string
) => {
  // Retrieve product variant details from the database
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      offerTag: true,
      subCategory: true,
      variants: {
        where: {
          id: variantId,
        },
        include: {
          images: true,
          colors: {
            select: {
              name: true,
            },
          },
          sizes: {
            select: {
              size: true,
              quantity: true,
              price: true,
              discount: true,
            },
          },
        },
      },
    },
  });
  if (!product) return;

  return {
    productId: product?.id,
    variantId: product?.variants[0].id,
    name: product.name,
    description: product?.description,
    variantName: product.variants[0].variantName,
    variantDescription: product.variants[0].variantDescription,
    images: product.variants[0].images,
    categoryId: product.categoryId,
    offerTagId: product.offerTagId,
    subCategoryId: product.subCategoryId,
    isSale: product.variants[0].isSale,
    brand: product.brand,
    sku: product.variants[0].sku,
    colors: product.variants[0].colors,
    sizes: product.variants[0].sizes,
    keywords: product.variants[0].keywords.split(","),
    variantImage: product.variants[0].variantImage,
  };
};

export const getAllStoreProducts = async (storeUrl: string) => {
  // Retrieve store details from the database using the store URL
  const store = await db.store.findUnique({ where: { url: storeUrl } });
  if (!store) throw new Error("Please provide a valid store URL.");

  // Retrieve all products associated with the store
  const products = await db.product.findMany({
    where: {
      storeId: store.id,
    },
    include: {
      category: true,
      subCategory: true,
      offerTag: true,
      variants: {
        include: {
          images: { orderBy: { createdAt: "asc" } },
          colors: true,
          sizes: true,
        },
      },
      store: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  });

  return products;
};

export const deleteProduct = async (productId: string) => {
  // Get current user
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");

  // Ensure user has seller privileges
  if (user.role !== "SELLER")
    throw new Error(
      "Unauthorized Access: Seller Privileges Required for Entry."
    );

  // Ensure product data is provided
  if (!productId) throw new Error("Please provide product id.");

  // Delete product from the database
  const response = await db.product.delete({ where: { id: productId } });
  return response;
};

export const getProducts = async (
  filters: any = {},
  sortBy = "",
  page: number = 1,
  pageSize: number = 10
) => {
  // Default values for page and pageSize
  const currentPage = page;
  const limit = pageSize;
  const skip = (currentPage - 1) * limit;

  // Construct the base query
  const wherClause: any = {
    AND: [],
  };

  // Apply store filter (using store URL)
  if (filters.store) {
    const store = await db.store.findUnique({
      where: {
        url: filters.store,
      },
      select: { id: true },
    });
    if (store) {
      wherClause.AND.push({ storeId: store.id });
    }
  }

  // Exclude product if sent
  if (filters.productId) {
    wherClause.AND.push({
      id: {
        not: filters.productId,
      },
    });
  }

  // Apply category filter (using category URL)
  if (filters.category) {
    const category = await db.category.findFirst({
      where: {
        url: filters.category,
      },
      select: { id: true },
    });
    if (category) {
      wherClause.AND.push({ categoryId: category.id });
    }
  }

  // Apply subCategory filter (using subCategory URL)
  if (filters.subCategory) {
    const subCategory = await db.subCategory.findFirst({
      where: {
        url: filters.subCategory,
      },
      select: { id: true },
    });
    if (subCategory) {
      wherClause.AND.push({ subCategoryId: subCategory.id });
    }
  }

  // Apply size filter (using array of sizes)
  if (filters.size && Array.isArray(filters.size)) {
    wherClause.AND.push({
      variants: {
        some: {
          sizes: {
            some: {
              size: {
                in: filters.size,
              },
            },
          },
        },
      },
    });
  }

  // Apply Offer filter (using offer URL)
  if (filters.offer) {
    const offer = await db.offerTag.findFirst({
      where: {
        url: filters.offer,
      },
      select: { id: true },
    });
    if (offer) {
      wherClause.AND.push({ offerTagId: offer.id });
    }
  }

  // Apply search filter (search term in product name or description)
  if (filters.search) {
    wherClause.AND.push({
      OR: [
        {
          name: { contains: filters.search },
        },
        {
          description: { contains: filters.search },
        },
        {
          variants: {
            some: {
              variantName: { contains: filters.search },
              variantDescription: { contains: filters.search },
            },
          },
        },
      ],
    });
  }

  // Apply price filters (min and max price)
  if (filters.minPrice || filters.maxPrice) {
    wherClause.AND.push({
      variants: {
        some: {
          sizes: {
            some: {
              price: {
                gte: filters.minPrice || 0, // Default to 0 if no min price is set
                lte: filters.maxPrice || Infinity, // Default to Infinity if no max price is set
              },
            },
          },
        },
      },
    });
  }

  if (filters.color && filters.color.length > 0) {
    wherClause.AND.push({
      variants: {
        some: {
          colors: {
            some: {
              name: { in: filters.color },
            },
          },
        },
      },
    });
  }

  // Define the sort order
  let orderBy: Record<string, SortOrder> = {};
  switch (sortBy) {
    case "most-popular":
      orderBy = { views: "desc" };
      break;
    case "new-arrivals":
      orderBy = { createdAt: "desc" };
      break;
    case "top-rated":
      orderBy = { rating: "desc" };
      break;
    default:
      orderBy = { views: "desc" };
  }

  // Get all filtered, sorted products
  const products = await db.product.findMany({
    where: wherClause,
    orderBy,
    take: limit, // Limit to page size
    skip: skip, // Skip the products of previous pages
    include: {
      variants: {
        include: {
          sizes: true,
          images: true,
          colors: true,
        },
      },
    },
  });

  type VariantWithSizes = ProductVariant & { sizes: Size[] };

  // Product price sorting
  products.sort((a, b) => {
    // Helper function to get the minimum price from a product's variants
    const getMinPrice = (product: any) =>
      Math.min(
        ...product.variants.flatMap((variant: VariantWithSizes) =>
          variant.sizes.map((size) => {
            const discount = size.discount;
            const discountedPrice = size.price * (1 - discount / 100);
            return discountedPrice;
          })
        ),
        Infinity // Default to Infinity if no sizes exist
      );

    // Get minimum prices for both products
    const minPriceA = getMinPrice(a);
    const minPriceB = getMinPrice(b);

    // Explicitly check for price sorting conditions
    if (sortBy === "price-low-to-high") {
      return minPriceA - minPriceB; // Ascending order
    } else if (sortBy === "price-high-to-low") {
      return minPriceB - minPriceA; // Descending order
    }

    // If no price sort option is provided, return 0 (no sorting by price)
    return 0;
  });

  // Transform the products with filtered variants into ProductCardType structure
  const productsWithFilteredVariants = products.map((product) => {
    // Filter the variants based on the filters
    const filteredVariants = product.variants;

    // Transform the filtered variants into the VariantSimplified structure
    const variants: VariantSimplified[] = filteredVariants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName ?? "",
      images: variant.images,
      sizes: variant.sizes,
    }));

    // Extract variant images for the product
    const variantImages: VariantImageType[] = filteredVariants.map(
      (variant) => ({
        url: `/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage
          : variant.images[0].url,
      })
    );

    // Return the product in the ProductCardType structure
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      sales: product.sales,
      numReviews: product.numReviews,
      variants,
      variantImages,
    };
  });

  /*
  const totalCount = await db.product.count({
    where: wherClause,
  });
  */

  const totalCount = products.length;

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Return the paginated data along with metadata
  return {
    products: productsWithFilteredVariants,
    totalPages,
    currentPage,
    pageSize,
    totalCount,
  };
};

export const getProductPageData = async (
  productSlug: string,
  variantSlug: string
) => {
  const product = await retrieveProductDetails(productSlug, variantSlug);

  if (!product) return;

  // calculate and retrieve shipping cost
  const shippingDetails = await getShippingDetails(
    product.shippingFeeMethod,
    product.store
  );
  const ratingStats = await getRatingStats(product.id);

  return formatProductResponse(product, shippingDetails, ratingStats);
};

export const retrieveProductDetails = async (
  productSlug: string,
  variantSlug: string
) => {
  const product = await db.product.findUnique({
    where: {
      slug: productSlug,
    },
    include: {
      category: true,
      subCategory: true,
      offerTag: true,
      store: true,
      specs: true,
      questions: true,
      variants: {
        where: {
          slug: variantSlug,
        },
        include: {
          images: true,
          colors: true,
          sizes: true,
          specs: true,
        },
      },
    },
  });

  if (!product) return null;

  const variant_images = await db.productVariant.findMany({
    where: { productId: product.id },
  });

  return product;
};

const formatProductResponse = async (
  product: ProductPageType,
  shippingDetails: ProductShippingDetailsType,
  ratingStats: RatingStatisticsType
) => {
  if (!product) return;

  const variant = product.variants[0];

  const { store, category, subCategory, offerTag, questions } = product;
  const { images, colors, sizes } = variant;

  return {
    productId: product.id,
    variantId: variant.id,
    productSlug: product.slug,
    variantSlug: variant.slug,
    name: product.name,
    description: product.description,
    variantName: variant.variantName,
    variantDescription: variant.variantDescription,
    images,
    variants: product.variants,
    category,
    subCategory,
    offerTag,
    isSale: variant.isSale,
    saleEndDate: variant.saleEndDate,
    brand: product.brand,
    sku: variant.sku,
    weight: variant.weight,
    variantImage: variant.variantImage,
    colors,
    sizes,
    reviewStats: ratingStats,
    store: {
      id: store.id,
      url: store.url,
      name: store.name,
      logo: store.logo,
      followersCount: 10,
      isUSerFollowingStore: true,
    },
    specs: {
      product: product.specs,
      variant: variant.specs,
    },
    questions,
    rating: product.rating,
    reviews: [],
    shippingDetails,
    relatedProducts: [],
  };
};

export const retrieveProductDetailsOptimized = async (productSlug: string) => {
  const product = await db.product.findUnique({
    where: {
      slug: productSlug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      numReviews: true,
      description: true,
      specs: true,
      questions: true,
      categoryId: true,
      subCategoryId: true,
      store: true,
      brand: true,
      shippingFeeMethod: true,
      _count: {
        select: { reviews: true },
      },
      variants: {
        select: {
          id: true,
          variantName: true,
          variantImage: true,
          weight: true,
          slug: true,
          sku: true,
          isSale: true,
          saleEndDate: true,
          variantDescription: true,
          keywords: true,
          specs: true,
          sizes: true,
          images: {
            select: { url: true },
          },
          colors: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const getShippingDetails = async (
  shippingFeeMethod: string,
  store: Store
) => {
  const shippingRate = await db.shippingRate.findFirst({
    where: {
      storeId: store.id,
    },
  });

  const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy;
  const shippingService =
    shippingRate?.shippingService || store.defaultShippingService;
  const shippingFeePerItem =
    shippingRate?.shippingFeePerItem || store.defaultShippingFeePerItem;
  const shippingFeeForAdditionalItem =
    shippingRate?.shippingFeeForAdditionalItem ||
    store.defaultShippingFeeForAdditionalItem;
  const shippingFeePerKg =
    shippingRate?.shippingFeePerKg || store.defaultShippingFeePerKg;
  const shippingFeeFixed =
    shippingRate?.shippingFeeFixed || store.defaultShippingFeeFixed;
  const deliveryTimeMin =
    shippingRate?.deliveryTimeMin || store.defaultDeliveryTimeMin;
  const deliveryTimeMax =
    shippingRate?.deliveryTimeMax || store.defaultDeliveryTimeMax;

  const shippingDetails = {
    shippingFeeMethod,
    shippingService,
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin,
    deliveryTimeMax,
    returnPolicy,
  };

  switch (shippingFeeMethod) {
    case "ITEM":
      shippingDetails.shippingFee = shippingFeePerItem;
      shippingDetails.extraShippingFee = shippingFeeForAdditionalItem;
      break;

    case "WEIGHT":
      shippingDetails.shippingFee = shippingFeePerKg;
      break;

    case "FIXED":
      shippingDetails.shippingFee = shippingFeeFixed;
      break;

    default:
      break;
  }
  return shippingDetails;
};

export const getRelatedProducts = async (
  productId: string,
  categoryId: string,
  subCategoryId: string
) => {
  const subCategoryProducts = await db.product.findMany({
    where: {
      subCategoryId: subCategoryId,
      categoryId: categoryId,
      id: {
        not: productId,
      },
    },
    include: {
      variants: {
        include: {
          sizes: true,
          images: true,
          colors: true,
        },
      },
    },
    take: 6,
  });

  let relatedProducts = subCategoryProducts;

  console.log(relatedProducts);

  if (relatedProducts.length < 6) {
    const remainCount = 6 - relatedProducts.length;
    const categoryProducts = await db.product.findMany({
      where: {
        categoryId,
        id: {
          notIn: [productId, ...relatedProducts.map((product) => product.id)],
        },
      },
      include: {
        variants: {
          include: {
            sizes: true,
            images: true,
            colors: true,
          },
        },
      },
      take: remainCount,
    });

    relatedProducts = [...relatedProducts, ...categoryProducts];
  }

  const productsWithFilteredVariants = relatedProducts.map((product) => {
    const filterdVariants = product.variants;

    const variants: VariantSimplified[] = filterdVariants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName ?? "",
      images: variant.images,
      sizes: variant.sizes,
    }));

    const variantImages: VariantImageType[] = filterdVariants.map(
      (variant) => ({
        url: `/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage
          : variant.images[0].url,
      })
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      sales: product.sales,
      numReviews: product.numReviews,
      variants,
      variantImages,
    };
  });

  return productsWithFilteredVariants;
};

export const getProductFilteredReviews = async (
  productId: string,
  filters: { rating?: number; hasImages?: boolean },
  sort: { orderBy: "latest" | "oldest" | "highest" } | undefined,
  page: number = 1,
  pageSize: number = 4
) => {
  const reviewFilter: any = {
    productId,
  };

  // Apply rating filter if provided
  if (filters.rating) {
    const rating = filters.rating;
    reviewFilter.rating = {
      in: [rating, rating + 0.5],
    };
  }

  // Apply image filter if provided
  if (filters.hasImages) {
    reviewFilter.images = {
      some: {},
    };
  }

  // Set sorting order using local SortOrder type
  const sortOption: { createdAt?: SortOrder; rating?: SortOrder } =
    sort && sort.orderBy === "latest"
      ? { createdAt: "desc" }
      : sort && sort.orderBy === "oldest"
      ? { createdAt: "asc" }
      : { rating: "desc" };

  // Calculate pagination parameters
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const statistics = await getRatingStats(productId);
  // Fetch reviews from the database
  const reviews = await db.review.findMany({
    where: reviewFilter,
    include: {
      user: true,
    },
    orderBy: sortOption,
    skip, // Skip records for pagination
    take, // Take records for pagination
  });

  return { reviews, statistics };
};

export const getRatingStats = async (productId: string) => {
  const ratingStats = await db.review.groupBy({
    by: ["rating"],
    where: {
      productId,
    },
    _count: {
      rating: true,
    },
  });

  const totalReviews = ratingStats.reduce(
    (sum, stat) => sum + stat._count.rating,
    0
  );

  const ratingCounts = Array(5).fill(0);

  ratingStats.forEach((stat) => {
    const rating = Math.floor(stat.rating);

    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1] = stat._count.rating;
    }
  });

  return {
    ratingStats: ratingCounts.map((count, index) => ({
      rating: index + 1,
      numReviews: count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    })),
    totalReviews,
  };
};

export const getDeliveryDetailsForStoreByCountry = async (storeId: string) => {
  // Get shipping rate
  const shippingRate = await db.shippingRate.findFirst({
    where: {
      storeId,
    },
  });

  let storeDetails;
  if (!shippingRate) {
    storeDetails = await db.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        defaultShippingService: true,
        defaultDeliveryTimeMin: true,
        defaultDeliveryTimeMax: true,
      },
    });
  }

  const shippingService = shippingRate
    ? shippingRate.shippingService
    : storeDetails?.defaultShippingService;

  const deliveryTimeMin = shippingRate
    ? shippingRate.deliveryTimeMin
    : storeDetails?.defaultDeliveryTimeMin;

  const deliveryTimeMax = shippingRate
    ? shippingRate.deliveryTimeMax
    : storeDetails?.defaultDeliveryTimeMax;

  return {
    shippingService,
    deliveryTimeMin,
    deliveryTimeMax,
  };
};

export const getProductShippingFee = async (
  shippingFeeMethod: string,
  store: Store,
  weight: number,
  quantity: number
) => {
  // Fetch shipping rate from the database for the given store and country
  const shippingRate = await db.shippingRate.findFirst({
    where: {
      storeId: store.id,
    },
  });

  // Destructure the shippingRate with defaults
  const {
    shippingFeePerItem = store.defaultShippingFeePerItem,
    shippingFeeForAdditionalItem = store.defaultShippingFeeForAdditionalItem,
    shippingFeePerKg = store.defaultShippingFeePerKg,
    shippingFeeFixed = store.defaultShippingFeeFixed,
  } = shippingRate || {};

  // Calculate the additional quantity (excluding the first item)
  const additionalItemsQty = quantity - 1;

  // Define fee calculation methods in a map (using functions)
  const feeCalculators: Record<string, () => number> = {
    ITEM: () =>
      shippingFeePerItem + shippingFeeForAdditionalItem * additionalItemsQty,
    WEIGHT: () => shippingFeePerKg * weight * quantity,
    FIXED: () => shippingFeeFixed,
  };

  // Check if the fee calculation method exists and calculate the fee
  const calculateFee = feeCalculators[shippingFeeMethod];
  if (calculateFee) {
    return calculateFee(); // Execute the corresponding calculation
  }

  // If no valid shipping method is found, return 0
  return 0;
};

export const getProductsByIds = async (
  ids: string[],
  page: number = 1,
  pageSize: number = 10
): Promise<{ products: any; totalPages: number }> => {
  // Check if ids array is empty
  if (!ids || ids.length === 0) {
    throw new Error("Ids are undefined");
  }

  // Default values for page and pageSize
  const currentPage = page;
  const limit = pageSize;
  const skip = (currentPage - 1) * limit;

  try {
    // Query the database for products with the specified ids
    const variants = await db.productVariant.findMany({
      where: {
        id: {
          in: ids, // Filter products whose idds are in the provided array
        },
      },
      select: {
        id: true,
        variantName: true,
        slug: true,
        images: {
          select: {
            url: true,
          },
        },
        sizes: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            rating: true,
            sales: true,
          },
        },
      },
      take: limit,
      skip: skip,
    });

    const new_products = variants.map((variant) => ({
      id: variant.product.id,
      slug: variant.product.slug,
      name: variant.product.name,
      rating: variant.product.rating,
      sales: variant.product.sales,
      variants: [
        {
          variantId: variant.id,
          variantName: variant.variantName,
          variantSlug: variant.slug,
          images: variant.images,
          sizes: variant.sizes,
        },
      ],
      variantImages: [],
    }));

    // Return products sorted in the order of ids provided
    const ordered_products = ids
      .map((id) =>
        new_products.find((product) => product.variants[0].variantId === id)
      )
      .filter(Boolean); // Filter out undefined values

    const allProducts = await db.productVariant.count({
      where: {
        id: {
          in: ids,
        },
      },
    });

    const totalPages = Math.ceil(allProducts / pageSize);

    return {
      products: ordered_products,
      totalPages,
    };
  } catch (error) {
    throw new Error("Failed to fetch products. Please try again.");
  }
};
