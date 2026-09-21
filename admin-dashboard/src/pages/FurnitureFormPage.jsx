import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import toast from 'react-hot-toast';

import { furnitureApi } from '../api/furnitureApi';
import { categoryApi } from '../api/categoryApi';

const ROOM_TYPES = [
  'living_room',
  'bedroom',
  'kitchen',
  'dining',
  'office',
  'outdoor',
];

const VOLTAGE_OPTIONS = ['120V', '240V'];

const ENERGY_RATING_OPTIONS = [
  'Energy Star Certified',
  'Standard',
];

const INITIAL_FORM = {
  name: '',
  description: '',
  itemType: 'furniture',
  category: '',
  widthCm: '',
  heightCm: '',
  depthCm: '',
  materials: '',
  roomTypes: [],
  specifications: [],
  voltage: '',
  powerConsumptionWatts: '',
  energyRating: '',
  stock: 0,
  isAvailable: true,
  isFeatured: false,
  isTrending: false,
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
};

const getCategoryId = (category) => {
  if (!category) return '';

  if (typeof category === 'string') {
    return category;
  }

  return category._id || category.id || '';
};

export default function FurnitureFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id) && id !== 'new';

  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [model3D, setModel3D] = useState(null);

  const [loading, setLoading] = useState(isEdit);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [loadError, setLoadError] = useState('');

  /*
   * Load categories + furniture when editing
   */
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setCategoriesLoading(true);
      setLoadError('');

      try {
        const categoryResponse = await categoryApi.list();

        const categoryData = normalizeArray(
          categoryResponse?.data?.data
        );

        if (mounted) {
          setCategories(categoryData);
        }

        if (!isEdit) {
          return;
        }

        setLoading(true);

        const furnitureResponse = await furnitureApi.get(id);

        const furniture = furnitureResponse?.data?.data;

        if (!furniture) {
          throw new Error('Furniture item not found');
        }

        if (!mounted) return;

        setForm({
          name: furniture.name || '',
          description: furniture.description || '',
          itemType: furniture.itemType || 'furniture',
          category: getCategoryId(furniture.category),

          widthCm:
            furniture.dimensions?.widthCm !== undefined
              ? String(furniture.dimensions.widthCm)
              : '',

          heightCm:
            furniture.dimensions?.heightCm !== undefined
              ? String(furniture.dimensions.heightCm)
              : '',

          depthCm:
            furniture.dimensions?.depthCm !== undefined
              ? String(furniture.dimensions.depthCm)
              : '',

          materials: Array.isArray(furniture.materials)
            ? furniture.materials.join(', ')
            : '',

          roomTypes: Array.isArray(furniture.roomTypes)
            ? furniture.roomTypes
            : [],

          specifications: Array.isArray(furniture.specifications)
            ? furniture.specifications.map((spec) => ({
                key: spec?.key || '',
                value: spec?.value || '',
              }))
            : [],

          voltage: furniture.voltage || '',

          powerConsumptionWatts:
            furniture.powerConsumptionWatts !== undefined &&
            furniture.powerConsumptionWatts !== null
              ? String(furniture.powerConsumptionWatts)
              : '',

          energyRating: furniture.energyRating || '',

          stock:
            furniture.stock !== undefined &&
            furniture.stock !== null
              ? furniture.stock
              : 0,

          isAvailable:
            furniture.isAvailable !== undefined
              ? Boolean(furniture.isAvailable)
              : true,

          isFeatured: Boolean(furniture.isFeatured),

          isTrending: Boolean(furniture.isTrending),
        });

        setExistingImages(
          Array.isArray(furniture.images)
            ? furniture.images
            : []
        );
      } catch (error) {
        console.error('Furniture form load error:', error);

        if (mounted) {
          const message = getErrorMessage(
            error,
            'Failed to load furniture data'
          );

          setLoadError(message);
          toast.error(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setCategoriesLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  /*
   * Update form field
   */
  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * Change furniture/appliance type
   */
  const handleItemTypeChange = (_, value) => {
    if (!value) return;

    setForm((previous) => ({
      ...previous,
      itemType: value,
      category: '',
      voltage: value === 'appliance' ? previous.voltage : '',
      powerConsumptionWatts:
        value === 'appliance'
          ? previous.powerConsumptionWatts
          : '',
      energyRating:
        value === 'appliance'
          ? previous.energyRating
          : '',
      materials:
        value === 'furniture'
          ? previous.materials
          : '',
      specifications:
        value === 'appliance'
          ? previous.specifications
          : [],
    }));
  };

  /*
   * Categories matching current item type
   */
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const productType =
        category?.productType || 'furniture';

      return productType === form.itemType;
    });
  }, [categories, form.itemType]);

  /*
   * If edit category is not returned by category list,
   * preserve it rather than showing an empty selection.
   */
  const selectedCategoryExists = filteredCategories.some(
    (category) =>
      String(category._id || category.id) ===
      String(form.category)
  );

  /*
   * Room type toggle
   */
  const toggleRoomType = (roomType) => {
    setForm((previous) => {
      const current = Array.isArray(previous.roomTypes)
        ? previous.roomTypes
        : [];

      return {
        ...previous,
        roomTypes: current.includes(roomType)
          ? current.filter((item) => item !== roomType)
          : [...current, roomType],
      };
    });
  };

  /*
   * Specifications
   */
  const addSpecification = () => {
    setForm((previous) => ({
      ...previous,
      specifications: [
        ...previous.specifications,
        {
          key: '',
          value: '',
        },
      ],
    }));
  };

  const updateSpecification = (
    index,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      specifications: previous.specifications.map(
        (specification, specificationIndex) =>
          specificationIndex === index
            ? {
                ...specification,
                [field]: value,
              }
            : specification
      ),
    }));
  };

  const removeSpecification = (index) => {
    setForm((previous) => ({
      ...previous,
      specifications:
        previous.specifications.filter(
          (_, specificationIndex) =>
            specificationIndex !== index
        ),
    }));
  };

  /*
   * Image selection
   */
  const handleImagesChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setNewImages((previous) => [
      ...previous,
      ...files,
    ]);

    event.target.value = '';
  };

  const removeNewImage = (index) => {
    setNewImages((previous) =>
      previous.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  };

  /*
   * Existing image delete
   */
  const handleDeleteExistingImage = async (
    image
  ) => {
    if (!isEdit || !image?.publicId) return;

    const confirmed = window.confirm(
      'Remove this image?'
    );

    if (!confirmed) return;

    try {
      await furnitureApi.removeImage(
        id,
        image.publicId
      );

      setExistingImages((previous) =>
        previous.filter(
          (item) =>
            item.publicId !== image.publicId
        )
      );

      toast.success('Image removed');
    } catch (error) {
      console.error(
        'Remove image error:',
        error
      );

      toast.error(
        getErrorMessage(
          error,
          'Failed to remove image'
        )
      );
    }
  };

  /*
   * 3D model
   */
  const handleModelChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = [
      '.glb',
      '.gltf',
      '.usdz',
    ];

    const fileName =
      file.name.toLowerCase();

    const valid = allowedExtensions.some(
      (extension) =>
        fileName.endsWith(extension)
    );

    if (!valid) {
      toast.error(
        'Please select a .glb, .gltf or .usdz file'
      );

      event.target.value = '';
      return;
    }

    setModel3D(file);
    event.target.value = '';
  };

  /*
   * Validation
   */
  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error('Enter furniture name');
      return false;
    }

    if (!form.description.trim()) {
      toast.error('Enter furniture description');
      return false;
    }

    if (!form.category) {
      toast.error('Select a category');
      return false;
    }

    if (
      form.widthCm === '' ||
      Number(form.widthCm) <= 0
    ) {
      toast.error('Enter a valid width');
      return false;
    }

    if (
      form.heightCm === '' ||
      Number(form.heightCm) <= 0
    ) {
      toast.error('Enter a valid height');
      return false;
    }

    if (
      form.depthCm === '' ||
      Number(form.depthCm) <= 0
    ) {
      toast.error('Enter a valid depth');
      return false;
    }

    if (
      form.stock === '' ||
      Number(form.stock) < 0
    ) {
      toast.error('Enter a valid stock quantity');
      return false;
    }

    return true;
  };

  /*
   * Submit
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(
        'name',
        form.name.trim()
      );

      formData.append(
        'description',
        form.description.trim()
      );

      formData.append(
        'itemType',
        form.itemType
      );

      formData.append(
        'category',
        form.category
      );

      formData.append(
        'dimensions',
        JSON.stringify({
          widthCm: Number(form.widthCm),
          heightCm: Number(form.heightCm),
          depthCm: Number(form.depthCm),
        })
      );

      const materials = form.materials
        .split(',')
        .map((material) => material.trim())
        .filter(Boolean);

      formData.append(
        'materials',
        JSON.stringify(materials)
      );

      formData.append(
        'roomTypes',
        JSON.stringify(form.roomTypes)
      );

      const specifications =
        form.specifications
          .filter(
            (specification) =>
              specification.key.trim() &&
              specification.value.trim()
          )
          .map((specification) => ({
            key: specification.key.trim(),
            value: specification.value.trim(),
          }));

      formData.append(
        'specifications',
        JSON.stringify(specifications)
      );

      formData.append(
        'stock',
        String(Number(form.stock))
      );

      formData.append(
        'isAvailable',
        String(form.isAvailable)
      );

      formData.append(
        'isFeatured',
        String(form.isFeatured)
      );

      formData.append(
        'isTrending',
        String(form.isTrending)
      );

      if (form.itemType === 'appliance') {
        if (form.voltage) {
          formData.append(
            'voltage',
            form.voltage
          );
        }

        if (
          form.powerConsumptionWatts !== ''
        ) {
          formData.append(
            'powerConsumptionWatts',
            String(
              Number(
                form.powerConsumptionWatts
              )
            )
          );
        }

        if (form.energyRating) {
          formData.append(
            'energyRating',
            form.energyRating
          );
        }
      }

      /*
       * Add newly selected images
       */
      newImages.forEach((image) => {
        formData.append('images', image);
      });

      let furnitureId = id;

      if (isEdit) {
        await furnitureApi.update(
          id,
          formData
        );
      } else {
        const response =
          await furnitureApi.create(formData);

        furnitureId =
          response?.data?.data?._id;
      }

      /*
       * Upload 3D model separately
       */
      if (model3D && furnitureId) {
        const modelFormData =
          new FormData();

        modelFormData.append(
          'model3D',
          model3D
        );

        await furnitureApi.uploadModel(
          furnitureId,
          modelFormData
        );
      }

      toast.success(
        isEdit
          ? 'Furniture updated successfully'
          : 'Furniture created successfully'
      );

      navigate('/furniture');
    } catch (error) {
      console.error(
        'Save furniture error:',
        error
      );

      toast.error(
        getErrorMessage(
          error,
          isEdit
            ? 'Failed to update furniture'
            : 'Failed to create furniture'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Loading screen
   */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />
          <Typography color="text.secondary">
            Loading furniture...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /*
   * Error
   */
  if (loadError && isEdit) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate('/furniture')
          }
          sx={{ mb: 2 }}
        >
          Back to Furniture
        </Button>

        <Alert severity="error">
          {loadError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        pb: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate('/furniture')
            }
            sx={{ mb: 1 }}
          >
            Back
          </Button>

          <Typography
            variant="h5"
            fontWeight={700}
          >
            {isEdit
              ? 'Edit Furniture'
              : 'Add Furniture'}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {isEdit
              ? 'Update furniture information and AR assets'
              : 'Add furniture or appliance to your AR catalog'}
          </Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          borderRadius: 3,
        }}
      >
        <Grid
          container
          spacing={2}
        >
          {/* Item type */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              Item Type
            </Typography>

            <ToggleButtonGroup
              exclusive
              value={form.itemType}
              onChange={
                handleItemTypeChange
              }
              size="small"
            >
              <ToggleButton value="furniture">
                Furniture
              </ToggleButton>

              <ToggleButton value="appliance">
                Appliance
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Name */}
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={(event) =>
                updateField(
                  'name',
                  event.target.value
                )
              }
              required
            />
          </Grid>

          {/* Category */}
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              select
              fullWidth
              label="Category"
              value={form.category}
              onChange={(event) =>
                updateField(
                  'category',
                  event.target.value
                )
              }
              required
              disabled={categoriesLoading}
              helperText={
                categoriesLoading
                  ? 'Loading categories...'
                  : filteredCategories.length === 0
                    ? 'No categories available for this type'
                    : ''
              }
            >
              {filteredCategories.map(
                (category) => (
                  <MenuItem
                    key={
                      category._id ||
                      category.id
                    }
                    value={
                      category._id ||
                      category.id
                    }
                  >
                    {category.name}
                  </MenuItem>
                )
              )}

              {isEdit &&
                form.category &&
                !selectedCategoryExists && (
                  <MenuItem
                    value={form.category}
                  >
                    Current Category
                  </MenuItem>
                )}
            </TextField>
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={form.description}
              onChange={(event) =>
                updateField(
                  'description',
                  event.target.value
                )
              }
              required
            />
          </Grid>

          {/* Stock */}
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <TextField
              fullWidth
              type="number"
              label="Stock"
              value={form.stock}
              onChange={(event) =>
                updateField(
                  'stock',
                  event.target.value
                )
              }
              inputProps={{
                min: 0,
                step: 1,
              }}
            />
          </Grid>

          {/* Dimensions */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />

            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 2 }}
            >
              Dimensions
            </Typography>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <TextField
              fullWidth
              type="number"
              label="Width (cm)"
              value={form.widthCm}
              onChange={(event) =>
                updateField(
                  'widthCm',
                  event.target.value
                )
              }
              inputProps={{
                min: 0,
                step: '0.1',
              }}
              required
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <TextField
              fullWidth
              type="number"
              label="Height (cm)"
              value={form.heightCm}
              onChange={(event) =>
                updateField(
                  'heightCm',
                  event.target.value
                )
              }
              inputProps={{
                min: 0,
                step: '0.1',
              }}
              required
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <TextField
              fullWidth
              type="number"
              label="Depth (cm)"
              value={form.depthCm}
              onChange={(event) =>
                updateField(
                  'depthCm',
                  event.target.value
                )
              }
              inputProps={{
                min: 0,
                step: '0.1',
              }}
              required
            />
          </Grid>

          {/* Furniture-specific */}
          {form.itemType === 'furniture' && (
            <>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Materials"
                  value={form.materials}
                  onChange={(event) =>
                    updateField(
                      'materials',
                      event.target.value
                    )
                  }
                  placeholder="Oak, Linen, Wood"
                  helperText="Separate multiple materials with commas"
                />
              </Grid>
            </>
          )}

          {/* Appliance-specific */}
          {form.itemType === 'appliance' && (
            <>
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Voltage"
                  value={form.voltage}
                  onChange={(event) =>
                    updateField(
                      'voltage',
                      event.target.value
                    )
                  }
                >
                  <MenuItem value="">
                    Select voltage
                  </MenuItem>

                  {VOLTAGE_OPTIONS.map(
                    (voltage) => (
                      <MenuItem
                        key={voltage}
                        value={voltage}
                      >
                        {voltage}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Power Consumption (Watts)"
                  value={
                    form.powerConsumptionWatts
                  }
                  onChange={(event) =>
                    updateField(
                      'powerConsumptionWatts',
                      event.target.value
                    )
                  }
                  inputProps={{
                    min: 0,
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Energy Rating"
                  value={
                    form.energyRating
                  }
                  onChange={(event) =>
                    updateField(
                      'energyRating',
                      event.target.value
                    )
                  }
                >
                  <MenuItem value="">
                    Select rating
                  </MenuItem>

                  {ENERGY_RATING_OPTIONS.map(
                    (rating) => (
                      <MenuItem
                        key={rating}
                        value={rating}
                      >
                        {rating}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              {/* Specifications */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ mb: 1 }}
                >
                  Specifications
                </Typography>

                <Stack spacing={1.5}>
                  {form.specifications.map(
                    (
                      specification,
                      index
                    ) => (
                      <Stack
                        key={index}
                        direction={{
                          xs: 'column',
                          sm: 'row',
                        }}
                        spacing={1}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Specification"
                          value={
                            specification.key
                          }
                          onChange={(
                            event
                          ) =>
                            updateSpecification(
                              index,
                              'key',
                              event.target.value
                            )
                          }
                        />

                        <TextField
                          fullWidth
                          size="small"
                          label="Value"
                          value={
                            specification.value
                          }
                          onChange={(
                            event
                          ) =>
                            updateSpecification(
                              index,
                              'value',
                              event.target.value
                            )
                          }
                        />

                        <IconButton
                          color="error"
                          onClick={() =>
                            removeSpecification(
                              index
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    )
                  )}

                  <Button
                    type="button"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={
                      addSpecification
                    }
                    sx={{
                      alignSelf: 'flex-start',
                    }}
                  >
                    Add Specification
                  </Button>
                </Stack>
              </Grid>
            </>
          )}

          {/* Room types */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              Suitable Room Types
            </Typography>

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
            >
              {ROOM_TYPES.map(
                (roomType) => {
                  const selected =
                    form.roomTypes.includes(
                      roomType
                    );

                  return (
                    <Chip
                      key={roomType}
                      label={roomType
                        .replaceAll(
                          '_',
                          ' '
                        )
                        .replace(/\b\w/g, (c) =>
                          c.toUpperCase()
                        )}
                      color={
                        selected
                          ? 'primary'
                          : 'default'
                      }
                      variant={
                        selected
                          ? 'filled'
                          : 'outlined'
                      }
                      onClick={() =>
                        toggleRoomType(
                          roomType
                        )
                      }
                    />
                  );
                }
              )}
            </Stack>
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />

            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              Catalog Status
            </Typography>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={2}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      form.isAvailable
                    }
                    onChange={(event) =>
                      updateField(
                        'isAvailable',
                        event.target
                          .checked
                      )
                    }
                  />
                }
                label="Available"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      form.isFeatured
                    }
                    onChange={(event) =>
                      updateField(
                        'isFeatured',
                        event.target
                          .checked
                      )
                    }
                  />
                }
                label="Featured"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      form.isTrending
                    }
                    onChange={(event) =>
                      updateField(
                        'isTrending',
                        event.target
                          .checked
                      )
                    }
                  />
                }
                label="Trending"
              />
            </Stack>
          </Grid>

          {/* Existing images */}
          {isEdit &&
            existingImages.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ mb: 1 }}
                >
                  Existing Images
                </Typography>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={2}
                >
                  {existingImages.map(
                    (image) => (
                      <Box
                        key={
                          image.publicId ||
                          image.url
                        }
                        sx={{
                          position:
                            'relative',
                          width: 120,
                          height: 100,
                          borderRadius: 2,
                          overflow:
                            'hidden',
                          border:
                            '1px solid',
                          borderColor:
                            'divider',
                        }}
                      >
                        <Box
                          component="img"
                          src={image.url}
                          alt="Furniture"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit:
                              'cover',
                          }}
                        />

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleDeleteExistingImage(
                              image
                            )
                          }
                          sx={{
                            position:
                              'absolute',
                            top: 4,
                            right: 4,
                            bgcolor:
                              'background.paper',
                            '&:hover': {
                              bgcolor:
                                'background.paper',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )
                  )}
                </Stack>
              </Grid>
            )}

          {/* New images */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              Add Images
            </Typography>

            <Button
              type="button"
              component="label"
              variant="outlined"
              startIcon={
                <CloudUploadIcon />
              }
            >
              Select Images

              <input
                hidden
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImagesChange
                }
              />
            </Button>

            {newImages.length > 0 && (
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={1}
                sx={{ mt: 1 }}
              >
                {newImages.map(
                  (image, index) => (
                    <Chip
                      key={`${image.name}-${index}`}
                      label={image.name}
                      onDelete={() =>
                        removeNewImage(
                          index
                        )
                      }
                      deleteIcon={
                        <DeleteIcon />
                      }
                    />
                  )
                )}
              </Stack>
            )}
          </Grid>

          {/* 3D Model */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              AR 3D Model
            </Typography>

            <Button
              type="button"
              component="label"
              variant="outlined"
              startIcon={
                <CloudUploadIcon />
              }
            >
              Select 3D Model

              <input
                hidden
                type="file"
                accept=".glb,.gltf,.usdz"
                onChange={
                  handleModelChange
                }
              />
            </Button>

            {model3D && (
              <Chip
                sx={{ ml: 1 }}
                label={model3D.name}
                onDelete={() =>
                  setModel3D(null)
                }
              />
            )}

            {isEdit &&
              !model3D &&
              existingImages &&
              form.name && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mt: 1,
                  }}
                >
                  Select a new 3D model only
                  if you want to replace the
                  existing AR model.
                </Typography>
              )}
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              navigate('/furniture')
            }
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={
              submitting ||
              categoriesLoading
            }
            startIcon={
              submitting ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : null
            }
          >
            {submitting
              ? 'Saving...'
              : isEdit
                ? 'Update Furniture'
                : 'Create Furniture'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}