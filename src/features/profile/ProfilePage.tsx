import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Teacher, Student, Admin } from '@/firebase/interfaces/user.interface'
import { Upload, MapPin, Phone, Mail, Edit2, Save, X } from 'lucide-react'
import { dangerToast, getCachedUser } from '@/lib/utils'
import { updateTeacherProfile } from '@/firebase/teachersUtils'
import { uploadFileWithFunction } from '@/firebase/firebaseFunctionUtils';
import GlobalLoader from '@/components/ui/global-loader'
type CurrentUser = Teacher | Student | Admin | null

interface ProfileFormData {
  phone: string
  additionalEmail: string
  address: string
  profilePictureUrl: File | string
}

type UserRole = 'admin' | 'teacher' | 'student'

interface RoleColors {
  admin: string
  teacher: string
  student: string
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [localProfilePictureUrl, setLocalProfilePictureUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    phone: '',
    additionalEmail: '',
    address: '',
    profilePictureUrl: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cachedUser = getCachedUser();
    if (cachedUser) {
      const parsed = cachedUser as unknown as CurrentUser;
      setCurrentUser(parsed)
      setFormData({
        phone: parsed?.phone || '',
        additionalEmail: parsed?.additionalEmail || '',
        address: parsed?.address || '',
        profilePictureUrl: parsed?.profilePictureUrl || '',
      })
    } else {
      navigate('/login')
    }
  }, [navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log("🚀 ~ handleProfilePictureChange ~ file:", file)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setLocalProfilePictureUrl(reader.result as string);
        setFormData({ ...formData, profilePictureUrl: file })
      }
      reader.readAsDataURL(file)
    }
  }

const handleSave = async () => {
  setLoading(true);

  try {
    if (!currentUser) {
      dangerToast("No current user to update profile for.");
      return;
    }

    const updatedData = { ...formData };

    // 1. Upload profile image if provided
    if (formData.profilePictureUrl instanceof File) {
      try {
        const uploadResult = await uploadFileWithFunction(formData.profilePictureUrl);

        if (!uploadResult || !uploadResult.url) {
          dangerToast("Failed to upload profile picture via function.");
          return;
        }

        updatedData.profilePictureUrl = uploadResult.url;
      } catch (err) {
        console.error("Error uploading profile picture via function:", err);
        dangerToast("Error uploading profile picture. Please try again.");
        return;
      }
    }

    // 2. Update teacher profile only if upload succeeded
    await updateTeacherProfile(currentUser.id, updatedData as Partial<Teacher>);

    console.log("Saving profile:", updatedData);
    setIsEditing(false);

  } catch (err) {
    console.error("Error saving profile:", err);
    dangerToast("Error saving profile. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
    setIsEditing(false)
    if (currentUser) {
      setFormData({
        phone: (currentUser as Teacher | Student | Admin & { phone?: string }).phone || '',
        additionalEmail: (currentUser as Teacher | Student | Admin & { additionalEmail?: string }).additionalEmail || '',
        address: (currentUser as Teacher | Student | Admin & { address?: string }).address || '',
        profilePictureUrl: currentUser.profilePictureUrl || '',
      })
    }
  }

  const getRoleColor = (role: UserRole): string => {
    const roleColors: RoleColors = {
      admin: 'from-purple-600 to-purple-400',
      teacher: 'from-blue-600 to-blue-400',
      student: 'from-green-600 to-green-400',
    }
    return roleColors[role] || 'from-gray-600 to-gray-400'
  }

  const getUserRole = (user: CurrentUser): UserRole => {
    if (!user) return 'student'
    if (user.role === 'admin') return 'admin'
    if (user.role === 'teacher') return 'teacher'
    return 'student'
  }

  if (!currentUser) {
    return <div className="p-4">Loading...</div>
  }

  const role = getUserRole(currentUser)
  const bgGradient = getRoleColor(role)
  const isTeacher = (user: CurrentUser): user is Teacher => user?.role === 'teacher'
  const isStudent = (user: CurrentUser): user is Student => user?.role === 'student'

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <GlobalLoader show={loading} />
      <div className="max-w-4xl mx-auto">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${bgGradient} rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 text-white shadow-lg`}>
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={localProfilePictureUrl || (typeof formData.profilePictureUrl === 'string' ? formData.profilePictureUrl : '')} alt={currentUser.userName} />
                <AvatarFallback className="bg-white text-gray-900 text-lg font-bold">
                  {String(currentUser.userName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white text-gray-900 rounded-full p-2 cursor-pointer hover:bg-gray-100 transition">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{currentUser.userName}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full capitalize font-semibold">
                  {role}
                </span>
                <span className="text-white/80">{currentUser.email}</span>
              </div>
              {isTeacher(currentUser) && currentUser.subject && (
                <p className="mt-2 text-white/90">
                  <strong>Subject:</strong> {currentUser.subject}
                </p>
              )}
              {isStudent(currentUser) && currentUser.rollNo && (
                <p className="mt-2 text-white/90">
                  <strong>Roll No:</strong> {currentUser.rollNo}
                </p>
              )}
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="bg-white text-gray-900 hover:bg-gray-100 border-0"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Main Content - Role specific */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          {/* Left column - Contact Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Update your contact details'
                  : 'Your contact information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Email - Read only */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  Primary Email
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentUser.email}</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    Not editable
                  </span>
                </div>
              </div>

              {/* Additional Email */}
              <div className="space-y-2">
                <Label htmlFor="additionalEmail" className="text-base font-semibold">
                  Additional Email
                </Label>
                {isEditing ? (
                  <Input
                    id="additionalEmail"
                    type="email"
                    name="additionalEmail"
                    value={formData.additionalEmail}
                    onChange={handleInputChange}
                    placeholder="Enter additional email"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formData.additionalEmail || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-semibold">
                  Address
                </Label>
                {isEditing ? (
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.address || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column - Account Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-semibold">{currentUser.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-semibold capitalize">{role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Active
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-semibold">
                    {currentUser.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific Info */}
            {role === 'teacher' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Teaching Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-semibold">{(currentUser as Teacher).subject || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Classes</p>
                    <p className="font-semibold">
                      {(currentUser as Teacher).classes?.length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Student Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-semibold">{(currentUser as Student).rollNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Classes Enrolled</p>
                    <p className="font-semibold">
                      {(currentUser as Student).classes?.length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">System Access</p>
                    <p className="font-semibold">Full Admin</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Permissions</p>
                    <p className="font-semibold">All Modules</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
